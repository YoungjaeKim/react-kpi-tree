import { Request, Response } from "express";
import KpiExternalConnection from "../schemas/kpiExternalConnection";
import { ExternalConnectionService } from "../services/external-connection-service";
import mongoose from 'mongoose';
import app from "../app";
import { ExternalConnectionConfig } from "../types/external-connection";

// Helper function to manage ExternalConnectionService
const startOrStopExternalConnectionService = async (app: any, connection: any, enable?: boolean) => {
  if (!app.locals.activeExternalConnectionService) {
    app.locals.activeExternalConnectionService = new ExternalConnectionService(app.locals.elementService);
  }
  const service: ExternalConnectionService = app.locals.activeExternalConnectionService;
  
  if (typeof enable === "boolean") {
    if (enable) {
      await service.startSingleConnection(connection.toObject());
    } else {
      service.stopSingleConnection(connection.name);
    }
  }
};

// Helper function to update connection
const updateConnectionDocument = async (filter: any, updateData: any) => {
  return KpiExternalConnection.findOneAndUpdate(
      filter,
      {$set: updateData},
      {new: true}
  );
};

// POST /connections (create or update by elementId)
export const upsertConnectionByElementId = async (req: Request, res: Response) => {
  try {
    const { elementId } = req.body;
    let connection = elementId
        ? await updateConnectionDocument({ elementId }, req.body)
        : null;

    let isNew = false;
    if (!connection) {
      connection = new KpiExternalConnection(req.body);
      await connection.save();
      isNew = true;
    }

    await startOrStopExternalConnectionService(req.app, connection, req.body.enable);
    return res.status(isNew ? 201 : 200).json(connection);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// GET /connections?elementId={elementId}
export const getConnectionsHandler = async (req: Request, res: Response) => {
  try {
    const { elementId } = req.query;
    
    if (elementId && !mongoose.Types.ObjectId.isValid(elementId as string)) {
      return res.status(400).json({ error: "Invalid elementId format" });
    }

    const filter = elementId ? { elementId } : {};
    const connections = await KpiExternalConnection.find(filter);
    if (!connections || connections.length === 0) {
      return res.status(404).json({ error: "No connections found" });
    }
    res.json(connections);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// GET /connections/by-element?elementId={elementId} (kept for backward compatibility)
export const getConnectionByElementId = async (req: Request, res: Response) => {
  try {
    const { elementId } = req.query;
    if (elementId && !mongoose.Types.ObjectId.isValid(elementId as string)) {
      return res.status(400).json({ error: "Invalid elementId format" });
    }

    const filter = elementId ? { elementId } : {};
    const connections = await KpiExternalConnection.find(filter);
    if (!connections || connections.length === 0) {
      return res.status(404).json({ error: "No connections found by the elementId" });
    }
    res.json(connections);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// GET /connections/:id
export const getConnectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await KpiExternalConnection.findById(id);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.json(connection);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// POST /connections/:id (update connection)
export const updateConnection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };
    delete updateFields.id; // Remove id if it was included in the body

    const connection = await updateConnectionDocument({ _id: id }, updateFields);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    await startOrStopExternalConnectionService(req.app, connection, updateFields.enable);
    res.json(connection);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// GET /connections/status?elementIds=id1,id2,id3
export const getConnectionStatuses = async (req: Request, res: Response) => {
  try {
    const { elementIds } = req.query;

    if (!elementIds || typeof elementIds !== "string") {
      return res
        .status(400)
        .json({ error: "elementIds query parameter is required" });
    }

    const ids = elementIds.split(",");
    if (ids.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one elementId is required" });
    }

    // Find all connections for the given elementIds
    const connections = await KpiExternalConnection.find({
      elementId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    // Create a map of elementId to connection status
    const statusMap = new Map(
      connections.map((conn) => [conn.elementId.toString(), conn.enable])
    );

    // Create response object with status for each requested elementId
    const response = ids.reduce((acc, elementId) => {
      acc[elementId] = statusMap.get(elementId) ?? null;
      return acc;
    }, {} as Record<string, boolean | null>);

    res.json(response);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// GET /connections/list
// returns a list of available connection type names
export const getConnectionSpec = async (req: Request, res: Response) => {
  try {
    const service: ExternalConnectionService = req.app.locals.activeExternalConnectionService;
    const adaptersMap = service.getAdapters();
    const adapters = Array.from(adaptersMap.keys()).map(name => ({ name }));

    res.json(adapters);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// POST /connections/validate
// validates connection configuration without saving it
export const validateConnection = async (req: Request, res: Response) => {
  try {
    const config: ExternalConnectionConfig = req.body;

    // Basic validation of required fields
    if (!config.type) {
      return res.status(400).json({
        success: false,
        message: 'Connection type is required',
        errors: ['Connection type is required']
      });
    }

    // Get the appropriate adapter
    const service: ExternalConnectionService = req.app.locals.activeExternalConnectionService;
    if (!service) {
      return res.status(500).json({
        success: false,
        message: 'External connection service not available',
        errors: ['External connection service not available']
      });
    }

    const adapter = service.getAdapters().get(config.type);
    if (!adapter) {
      return res.status(400).json({
        success: false,
        message: `Unknown connection type: ${config.type}`,
        errors: [`Unknown connection type: ${config.type}`]
      });
    }

    // Validate the configuration using the adapter
    const validationResult = await adapter.validate(config);
    
    res.status(validationResult.success ? 200 : 400).json(validationResult);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation',
      errors: [err.message]
    });
  }
};
