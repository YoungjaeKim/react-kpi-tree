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
        connectionStatus?: boolean | null;
        connectionType?: string;
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

function transformNodeResponse(node: PopulatedNodeObject, connectionStatus: boolean | null, connectionType?: string): NodeResponse {
    const { elementId, _id, ...rest } = node;
    const response = {
        ...rest,
        id: _id.toString(),
        groupId: rest.groupId.toString()
    } as NodeResponse;

    if (elementId) {
        const { _id: elementIdValue, kpiValue, kpiValueType, isActive, expression, lastUpdatedDateTime } = elementId;
        response.element = {
            id: elementIdValue.toString(),
            kpiValue,
            kpiValueType,
            isActive,
            expression,
            lastUpdatedDateTime,
            connectionStatus,
            connectionType
        };
    }
    return response;
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

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, archived } = req.body;

    try {
        const group = await KpiGroup.findByIdAndUpdate(id, { title, archived }, { new: true });
        res.status(200).json(group);
    } catch (err) {
        console.error('Failed to update group:', err);
        res.status(500).json({ error: 'Failed to update group' });
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

        // Create a map of elementId to connection status and type
        const connectionMap = new Map(
            externalConnections.map(conn => [
                conn.elementId.toString(),
                { enable: conn.enable, type: conn.type }
            ])
        );

        res.json({
            nodes: nodes.map((node) => {
                const nodeObject = node.toObject() as PopulatedNodeObject;
                const connection = connectionMap.get(nodeObject.elementId?._id.toString());
                return transformNodeResponse(
                    nodeObject,
                    connection?.enable ?? null,
                    connection?.type
                );
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

        // Create a map of elementId to connection status and type
        const connectionMap = new Map(
            externalConnections.map(conn => [
                conn.elementId.toString(),
                { enable: conn.enable, type: conn.type }
            ])
        );

        res.json(
            kpiNodes.map((node) => {
                const nodeObject = node.toObject() as PopulatedNodeObject;
                const connection = connectionMap.get(nodeObject.elementId?._id.toString());
                return transformNodeResponse(
                    nodeObject,
                    connection?.enable ?? null,
                    connection?.type
                );
            })
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error at getNodes' });
    }
};

export const getNodeById = async (req: Request, res: Response): Promise<void> => {
    const nodeId = req.params.id;
    if (isNullOrEmpty(nodeId)) {
        res.status(400).json({ error: "invalid id" });
        return;
    }

    try {
        // Find the resource with the matching ID and populate elementId
        const resource = await KpiNode.findById(nodeId)
            .populate<{ elementId: PopulatedElement }>('elementId');

        if (!resource) {
            res.status(404).json({ error: "Resource not found" });
        } else {
            const nodeObject = resource.toObject() as PopulatedNodeObject;
            
            // Get connection status if elementId exists
            let connectionStatus = null;
            if (nodeObject.elementId) {
                const externalConnection = await KpiExternalConnection.findOne({ elementId: nodeObject.elementId._id });
                connectionStatus = externalConnection?.enable ?? null;
            }

            res.json(transformNodeResponse(nodeObject, connectionStatus));
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error at getNode' });
    }
};

async function createKpiElement(elementData: any): Promise<Types.ObjectId> {
    const newKpiElement = new KpiElement({
        kpiValue: elementData.elementValue,
        kpiValueType: elementData.elementValueType,
        isActive: elementData.elementIsActive,
        expression: elementData.elementExpression,
        lastUpdatedDateTime: Date.now()
    });
    const savedKpiElement = await newKpiElement.save();
    return savedKpiElement._id;
}

async function createKpiNode(nodeData: any, elementId: Types.ObjectId): Promise<Document> {
    const kpiNode = new KpiNode({
        position: nodeData.position,
        groupId: nodeData.groupId,
        title: nodeData.title,
        description: nodeData.description,
        label: nodeData.label,
        elementId,
        hidden: nodeData.hidden
    });
    return kpiNode.save();
}

async function updateKpiNode(node: Document, updateData: any): Promise<Document> {
    const kpiNode = node as any;
    kpiNode.position = updateData.position !== undefined ? updateData.position : kpiNode.position;
    kpiNode.groupId = updateData.groupId || kpiNode.groupId;
    kpiNode.title = updateData.title || kpiNode.title;
    kpiNode.description = updateData.description || kpiNode.description;
    kpiNode.label = updateData.label !== undefined ? updateData.label : kpiNode.label;
    kpiNode.elementId = updateData.elementId || kpiNode.elementId;
    kpiNode.hidden = updateData.hidden !== undefined ? updateData.hidden : kpiNode.hidden;
    return kpiNode.save();
}

async function getNodeWithConnectionStatus(nodeId: Types.ObjectId): Promise<{ nodeObject: PopulatedNodeObject; connectionStatus: boolean | null; connectionType?: string }> {
    const populatedNode = await KpiNode.findById(nodeId)
        .populate<{ elementId: PopulatedElement }>('elementId');
    
    if (!populatedNode) {
        throw new Error('Node not found');
    }

    const nodeObject = populatedNode.toObject() as PopulatedNodeObject;
    let connectionStatus = null;
    let connectionType: string | undefined;

    if (nodeObject.elementId) {
        const externalConnection = await KpiExternalConnection.findOne({ elementId: nodeObject.elementId._id });
        connectionStatus = externalConnection?.enable ?? null;
        connectionType = externalConnection?.type;
    }

    return { nodeObject, connectionStatus, connectionType };
}

/**
 * Helper function to update group counts based on actual node and edge counts
 */
async function updateGroupCounts(groupId: string | Types.ObjectId): Promise<void> {
    try {
        // Count non-hidden nodes in the group
        const nodeCount = await KpiNode.countDocuments({ 
            groupId: groupId, 
            hidden: false 
        });
        
        // Count all edges in the group
        const edgeCount = await KpiEdge.countDocuments({ groupId: groupId });
        
        // Update the group with actual counts
        await KpiGroup.findByIdAndUpdate(groupId, {
            nodeCount,
            edgeCount
        });
    } catch (error) {
        console.error('Error updating group counts:', error);
        // Don't throw error to avoid disrupting the main operation
    }
}

export const upsertNode = async (req: Request, res: Response): Promise<void> => {
    try {
        let kpiNode: Document;
        let isNew = false;

        if (isNullOrEmpty(req.body.id)) {
            // Handle new node creation
            let elementId = req.body.elementId;
            
            if (isNullOrEmpty(elementId)) {
                elementId = await createKpiElement(req.body);
            }
            
            kpiNode = await createKpiNode(req.body, elementId);
            isNew = true;
        } else {
            // Handle existing node update
            const foundNode = await KpiNode.findById(req.body.id);
            if (!foundNode) {
                res.status(404).json({ error: `Node resource id '${req.body.id}' not found` });
                return;
            }
            
            kpiNode = await updateKpiNode(foundNode, req.body);
        }

        // Get populated node with connection status
        const { nodeObject, connectionStatus, connectionType } = await getNodeWithConnectionStatus(kpiNode._id);
        
        // Update group counts after node upsert
        await updateGroupCounts(nodeObject.groupId);
        
        res.status(isNew ? 201 : 200).json(transformNodeResponse(nodeObject, connectionStatus, connectionType));
    } catch (err) {
        console.error('Failed to upsert node:', err);
        res.status(500).json({ error: 'Failed to upsert node' });
    }
};

export const upsertEdge = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.id) {
        try {
            const newKpiEdge = new KpiEdge(req.body);
            const savedKpiEdge = await newKpiEdge.save();
            
            // Update group counts after edge creation
            await updateGroupCounts(savedKpiEdge.groupId);
            
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
            
            // Update group counts after edge update
            await updateGroupCounts(updatedKpiEdge.groupId);
            
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

        // Populate the elementId before sending response
        const populatedNode = await KpiNode.findById(node._id)
            .populate<{ elementId: PopulatedElement }>('elementId');

        if (!populatedNode) {
            res.status(404).json({ error: 'Node not found after update' });
            return;
        }

        const nodeObject = populatedNode.toObject() as PopulatedNodeObject;

        // Get connection status if elementId exists
        let connectionStatus = null;
        if (nodeObject.elementId) {
            const externalConnection = await KpiExternalConnection.findOne({ elementId: nodeObject.elementId._id });
            connectionStatus = externalConnection?.enable ?? null;
        }

        // Update group counts after node update
        await updateGroupCounts(nodeObject.groupId);

        res.json(transformNodeResponse(nodeObject, connectionStatus));
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

    // query the edge to get the groupId
    const edge = await KpiEdge.findById(edgeId);
    if (!edge) {
        res.status(404).json({ error: "Edge not found" });
        return;
    }

    try {
        const deletedEdge = await KpiEdge.findByIdAndDelete(edgeId);
        if (!deletedEdge) {
            res.status(404).json({ error: "Edge not found" });
            return;
        }
        
        // Update group counts after edge deletion
        await updateGroupCounts(edge.groupId);
        
        res.status(200).json({ message: "Edge deleted successfully" });
    } catch (err) {
        console.error('Failed to delete edge:', err);
        res.status(500).json({ error: 'Server error at deleteEdge' });
    }
};
