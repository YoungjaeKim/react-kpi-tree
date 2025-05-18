import { Request, Response } from 'express';
import KpiExternalConnection from '../schemas/kpiExternalConnection';

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
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json(connection);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
