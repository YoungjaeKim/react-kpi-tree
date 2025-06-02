import { Request, Response } from "express";
import KpiExternalConnection from "../schemas/kpiExternalConnection";
import { ExternalConnectionService } from "../services/external-connection-service";
import mongoose from 'mongoose';
import app from "../app";

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
    const { username, authToken, url, pollingPeriodSeconds, enable } = req.body;

    // Only include fields that are actually provided
    const updateFields: any = {};
    if (username !== undefined) updateFields.username = username;
    if (authToken !== undefined) updateFields.authToken = authToken;
    if (url !== undefined) updateFields.url = url;
    if (pollingPeriodSeconds !== undefined) updateFields.pollingPeriodSeconds = pollingPeriodSeconds;
    if (enable !== undefined) updateFields.enable = enable;

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

export interface ExternalConnectionConfig {
  name: string;
  elementId: string;
  type: string;
  parameters: Record<string, any>;
  url: string;
  username: string;
  authToken: string;
  pollingPeriodSeconds: number;
  enable: boolean;
}

// GET /connections/spec
// returns a list of available connection type names
export const getConnectionSpec = async (req: Request, res: Response) => {
  try {
    const adaptersMap = app.locals.activeExternalConnectionService.adapters;
    const adapters = Array.from(adaptersMap.keys()).map(name => ({ name }));

    res.json(adapters);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
