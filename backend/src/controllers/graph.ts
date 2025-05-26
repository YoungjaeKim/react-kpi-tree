import { Request, Response } from '../types/express';
import KpiNode from '../schemas/kpiNode';
import KpiEdge from '../schemas/kpiEdge';
import KpiElement, { IKpiElement } from '../schemas/kpiElement';
import KpiGroup from '../schemas/kpiGroup';
import KpiExternalConnection from '../schemas/kpiExternalConnection';
import { isNullOrEmpty } from '../utils';
import { Document, Types } from 'mongoose';

interface NodeResponse {
    id: string;
    position: {
        x: number;
        y: number;
    };
    groupId: string;
    title?: string;
    label?: string;
    element?: {
        id: string;
        kpiValue: string;
        kpiValueType: string;
        isActive: boolean;
        expression?: string;
        lastUpdatedDateTime: Date;
        connectionStatus?: boolean;
    };
    hidden: boolean;
}

interface EdgeResponse {
    id: string;
    source: string;
    target: string;
    groupId: string;
}

interface PopulatedElement extends IKpiElement {
    externalConnection?: {
        enable: boolean;
    };
}

interface PopulatedNode extends Document {
    elementId: PopulatedElement;
    position: {
        x: number;
        y: number;
    };
    groupId: Types.ObjectId;
    title?: string;
    description?: string;
    label?: string;
    hidden: boolean;
}

interface PopulatedNodeObject {
    elementId: PopulatedElement;
    position: {
        x: number;
        y: number;
    };
    groupId: Types.ObjectId;
    title?: string;
    description?: string;
    label?: string;
    hidden: boolean;
    _id: Types.ObjectId;
}

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, archived } = req.body;
        const group = new KpiGroup({
            title,
            archived
        });

        const savedKpiGroup = await group.save();
        res.status(201).json(savedKpiGroup);
    } catch (err) {
        console.error('Failed to save document:', err);
        res.status(500).send('Failed to save document');
    }
};

export const getGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const { archived } = req.query;
        const query: any = {};

        if (archived !== undefined) {
            query.archived = archived.toLowerCase() === 'true';
        }

        const groups = await KpiGroup.find(query);
        res.json(groups.map(group => {
            const groupObject = group.toObject();
            return { ...groupObject, id: groupObject._id, _id: undefined };
        }));
    } catch (err) {
        console.error('Failed to fetch groups:', err);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
};

export const getGroupById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (isNullOrEmpty(id)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
    }

    try {
        const group = await KpiGroup.findById(id);
        if (!group) {
            res.status(404).json({ error: "Group not found" });
        } else {
            const groupObject = group.toObject();
            res.json({ ...groupObject, id: groupObject._id, _id: undefined });
        }
    } catch (err) {
        console.error('Failed to fetch group:', err);
        res.status(500).json({ error: 'Failed to fetch group' });
    }
};

export const getGraphs = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupId = req.query.groupId as string;
        const hidden = req.query.hidden as string;

        if (isNullOrEmpty(groupId)) {
            res.status(404).json({ error: "groupId is required" });
            return;
        }

        // Build the query object
        const query: { groupId: string; hidden?: boolean } = { groupId };
        if (hidden !== undefined) {
            query.hidden = hidden.toLowerCase() === 'true';
        }

        const [nodes, edges] = await Promise.all([
            KpiNode.find(query)
                .populate<{ elementId: PopulatedElement }>('elementId'),
            KpiEdge.find({ groupId: groupId })
        ]);

        // Get all elementIds from nodes
        const elementIds = nodes
            .map(node => node.elementId?._id)
            .filter(id => id !== undefined);

        // Fetch external connections for all elements at once
        const externalConnections = await KpiExternalConnection.find({
            elementId: { $in: elementIds }
        });

        // Create a map of elementId to connection status
        const connectionMap = new Map(
            externalConnections.map(conn => [conn.elementId.toString(), conn.enable])
        );

        res.json({
            nodes: nodes.map((node) => {
                const nodeObject = node.toObject() as PopulatedNodeObject;
                const { elementId, _id, ...rest } = nodeObject;
                const response = {
                    ...rest,
                    id: _id.toString(),
                    groupId: rest.groupId.toString()
                } as NodeResponse;

                // Add element if elementId exists
                if (elementId) {
                    const { _id: elementIdValue, kpiValue, kpiValueType, isActive, expression, lastUpdatedDateTime } = elementId;
                    response.element = {
                        id: elementIdValue.toString(),
                        kpiValue,
                        kpiValueType,
                        isActive,
                        expression,
                        lastUpdatedDateTime,
                        connectionStatus: connectionMap.get(elementIdValue.toString()) || false
                    };
                }

                return response;
            }),
            edges: edges.map((edge) => {
                const edgeObject = edge.toObject();
                const response: EdgeResponse = {
                    id: edgeObject._id.toString(),
                    source: edgeObject.source.toString(),
                    target: edgeObject.target.toString(),
                    groupId: edgeObject.groupId.toString()
                };
                return response;
            }),
        });
    } catch (error) {
        console.error('Error fetching graph:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getNodes = async (req: Request, res: Response): Promise<void> => {
    const groupId = req.query.groupId as string;
    const hidden = req.query.hidden as string;

    if (isNullOrEmpty(groupId)) {
        res.status(404).json({ error: "groupId is required" });
        return;
    }

    try {
        // Build the query object
        const query: { groupId: string; hidden?: boolean } = { groupId };
        if (hidden !== undefined) {
            query.hidden = hidden.toLowerCase() === 'true';
        }

        // Find KpiNodes based on the query and populate KpiElement by elementId
        const kpiNodes = await KpiNode.find(query)
            .populate<{ elementId: PopulatedElement }>('elementId')
            .exec();

        // Get all elementIds from nodes
        const elementIds = kpiNodes
            .map(node => node.elementId?._id)
            .filter(id => id !== undefined);

        // Fetch external connections for all elements at once
        const externalConnections = await KpiExternalConnection.find({
            elementId: { $in: elementIds }
        });

        // Create a map of elementId to connection status
        const connectionMap = new Map(
            externalConnections.map(conn => [conn.elementId.toString(), conn.enable])
        );

        res.json(
            kpiNodes.map((node) => {
                const nodeObject = node.toObject() as PopulatedNodeObject;
                const { elementId, _id, ...rest } = nodeObject;
                const response = {
                    ...rest,
                    id: _id.toString(),
                    groupId: rest.groupId.toString()
                } as NodeResponse;

                // Add element if elementId exists
                if (elementId) {
                    const { _id: elementIdValue, kpiValue, kpiValueType, isActive, expression, lastUpdatedDateTime } = elementId;
                    response.element = {
                        id: elementIdValue.toString(),
                        kpiValue,
                        kpiValueType,
                        isActive,
                        expression,
                        lastUpdatedDateTime,
                        connectionStatus: connectionMap.get(elementIdValue.toString()) || false
                    };
                }

                return response;
            })
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error at getNodes' });
    }
};

export const getNodeById = async (req: Request, res: Response): Promise<void> => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }

    try {
        // Find the resource with the matching ID and populate elementId
        const resource = await KpiNode.findById(resourceId)
            .populate<{ elementId: PopulatedElement }>('elementId');

        if (!resource) {
            res.status(404).json({ error: "Resource not found" });
        } else {
            const nodeObject = resource.toObject() as PopulatedNodeObject;
            const { elementId, _id, ...rest } = nodeObject;
            
            // Get connection status if elementId exists
            let connectionStatus = false;
            if (elementId) {
                const externalConnection = await KpiExternalConnection.findOne({ elementId: elementId._id });
                connectionStatus = externalConnection?.enable || false;
            }

            const response = {
                ...rest,
                id: _id.toString(),
                groupId: rest.groupId.toString(),
                element: elementId ? {
                    ...elementId,
                    id: elementId._id.toString(),
                    _id: undefined,
                    connectionStatus
                } : undefined
            };
            
            res.json(response);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error at getNode' });
    }
};

export const upsertNode = async (req: Request, res: Response): Promise<void> => {
    if (isNullOrEmpty(req.body.id)) { // create
        // check elementId is empty
        if (isNullOrEmpty(req.body.elementId)) {
            // create Element first
            const newKpiElement = new KpiElement({
                kpiValue: req.body.elementValue,
                kpiValueType: req.body.elementValueType,
                isActive: req.body.elementIsActive,
                expression: req.body.elementExpression,
                lastUpdatedDateTime: Date.now()
            });
            const savedKpiElement = await newKpiElement.save();
            req.body.elementId = savedKpiElement._id;
        }

        try {
            const newKpiNode = new KpiNode({
                position: req.body.position,
                groupId: req.body.groupId,
                title: req.body.title,
                description: req.body.description,
                label: req.body.label,
                elementId: req.body.elementId,
                hidden: req.body.hidden
            });
            const savedKpiNode = await newKpiNode.save();
            // Populate the elementId before sending response
            const populatedNode = await KpiNode.findById(savedKpiNode._id)
                .populate<{ elementId: PopulatedElement }>('elementId');

            if (!populatedNode) {
                res.status(404).json({ error: 'Node not found after creation' });
                return;
            }

            const nodeObject = populatedNode.toObject() as PopulatedNodeObject;
            const { elementId, ...nodeWithoutElementId } = nodeObject;

            // Get connection status if elementId exists
            let connectionStatus = false;
            if (elementId) {
                const externalConnection = await KpiExternalConnection.findOne({ elementId: elementId._id });
                connectionStatus = externalConnection?.enable || false;
            }

            res.status(201).json({
                ...nodeWithoutElementId,
                id: nodeObject._id,
                _id: undefined,
                element: elementId ? {
                    ...elementId,
                    id: elementId._id,
                    _id: undefined,
                    connectionStatus
                } : undefined
            });
        } catch (err) {
            console.error('Failed to save document:', err);
            res.status(500).json({ error: 'Failed to save document' });
        }
    } else { // update
        try {
            const kpiNode = await KpiNode.findById(req.body.id);
            if (!kpiNode) {
                res.status(404).json({error: `Node resource id '${req.body.id}' not found`});
                return;
            }
            kpiNode.position = req.body.position !== undefined ? req.body.position : kpiNode.position;
            kpiNode.groupId = req.body.groupId || kpiNode.groupId;
            kpiNode.title = req.body.title || kpiNode.title;
            kpiNode.description = req.body.description || kpiNode.description;
            kpiNode.label = req.body.label !== undefined ? req.body.label : kpiNode.label;
            kpiNode.elementId = req.body.elementId || kpiNode.elementId;
            kpiNode.hidden = req.body.hidden !== undefined ? req.body.hidden : kpiNode.hidden;

            const savedKpiNode = await kpiNode.save();
            // Populate the elementId before sending response
            const populatedNode = await KpiNode.findById(savedKpiNode._id)
                .populate<{ elementId: PopulatedElement }>('elementId');

            if (!populatedNode) {
                res.status(404).json({ error: 'Node not found after update' });
                return;
            }

            const nodeObject = populatedNode.toObject() as PopulatedNodeObject;
            const { elementId, ...nodeWithoutElementId } = nodeObject;

            // Get connection status if elementId exists
            let connectionStatus = false;
            if (elementId) {
                const externalConnection = await KpiExternalConnection.findOne({ elementId: elementId._id });
                connectionStatus = externalConnection?.enable || false;
            }

            res.status(200).json({
                ...nodeWithoutElementId,
                id: nodeObject._id,
                _id: undefined,
                element: elementId ? {
                    ...elementId,
                    id: elementId._id,
                    _id: undefined,
                    connectionStatus
                } : undefined
            });
        } catch (err) {
            console.error('Failed to update document:', err);
            res.status(500).json({ error: 'Failed to update document' });
        }
    }
};

export const upsertEdge = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.id) {
        try {
            const newKpiEdge = new KpiEdge(req.body);
            const savedKpiEdge = await newKpiEdge.save();
            res.status(201).json(savedKpiEdge);
        } catch (err) {
            console.error('Failed to save document:', err);
            res.status(500).json({ error: 'Failed to save Edge document' });
        }
    } else {
        try {
            const kpiEdge = await KpiEdge.findById(req.body.id);
            if (!kpiEdge) {
                res.status(404).json({ error: `Edge resource id '${req.body.id}' not found` });
                return;
            }
            kpiEdge.source = req.body.source;
            kpiEdge.target = req.body.target;
            kpiEdge.groupId = req.body.groupId;
            const updatedKpiEdge = await kpiEdge.save();
            res.status(200).json(updatedKpiEdge);
        } catch (err) {
            console.error('Failed to update document:', err);
            res.status(500).json({ error: 'Failed to update Edge document' });
        }
    }
};

export const updateNode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const update = req.body;
        
        const node = await KpiNode.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );

        if (!node) {
            res.status(404).json({ error: 'Node not found' });
            return;
        }

        res.json(node);
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteEdge = async (req: Request, res: Response): Promise<void> => {
    const edgeId = req.params.id;

    if (isNullOrEmpty(edgeId)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }

    try {
        const deletedEdge = await KpiEdge.findByIdAndDelete(edgeId);
        if (!deletedEdge) {
            res.status(404).json({ error: "Edge not found" });
            return;
        }
        res.status(200).json({ message: "Edge deleted successfully" });
    } catch (err) {
        console.error('Failed to delete edge:', err);
        res.status(500).json({ error: 'Server error at deleteEdge' });
    }
};
