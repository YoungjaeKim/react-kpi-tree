import { Request, Response } from "express";
import KpiExternalConnection from "../schemas/kpiExternalConnection";
import { ExternalConnectionService } from "../services/external-connection-service";
import mongoose from 'mongoose';

// POST /connections
export const createConnection = async (req: Request, res: Response) => {
  try {
    const connection = new KpiExternalConnection(req.body);
    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// GET /connections?elementId={elementId}
export const getConnections = async (req: Request, res: Response) => {
  try {
    const { elementId } = req.query;
    const filter = elementId ? { elementId } : {};
    const connections = await KpiExternalConnection.find(filter);
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
    if (pollingPeriodSeconds !== undefined)
      updateFields.pollingPeriodSeconds = pollingPeriodSeconds;
    if (enable !== undefined) updateFields.enable = enable;

    const connection = await KpiExternalConnection.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Dynamically start/stop polling for this connection
    const app = req.app as any;
    const elementService = app.locals.elementService;
    if (!app.locals.activeExternalConnectionService) {
      app.locals.activeExternalConnectionService =
        new ExternalConnectionService(elementService);
    }
    const service: ExternalConnectionService =
      app.locals.activeExternalConnectionService;
    if (typeof updateFields.enable === "boolean") {
      if (updateFields.enable) {
        // Start polling for this connection only
        await service.startSingleConnection(connection.toObject());
      } else {
        // Stop polling for this connection only
        service.stopSingleConnection(connection.name);
      }
    }
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
