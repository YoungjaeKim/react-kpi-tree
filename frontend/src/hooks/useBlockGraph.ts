import {useState, useEffect} from 'react';
import {Node} from '@xyflow/react';
import {BlockNode, BlockEdge, BlockEdgeTransferForCreate} from '../types';
import {getNodesAndElements, updateNode, addEdge} from '../services/blockGraphService';

export const useBlockGraph = (groupId: string) => {
    const [nodes, setNodes] = useState<BlockNode[]>([]);
    const [edges, setEdges] = useState<BlockEdge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [hiddenNodes, setHiddenNodes] = useState<BlockNode[]>([]);
    const [selectedHiddenNode, setSelectedHiddenNode] = useState<string>("");

    useEffect(() => {
        if (!groupId) {
            return;
        }
        getNodesAndElements(`${process.env.REACT_APP_API_URL}/graphs?groupId=${groupId}&hidden=false`)
            .then(async (response) => {
                console.log(`Total nodes: ${response.nodes.length}, Total edges: ${response.edges.length}`);
                setNodes(response.nodes);
                setEdges(response.edges);

                // Get all element IDs from nodes
                const elementIds = response.nodes
                    .map(node => node.data.elementId)
                    .filter((id): id is string => id !== undefined);

                if (elementIds.length > 0) {
                    try {
                        // Fetch connection statuses
                        const statusResponse = await fetch(
                            `${process.env.REACT_APP_API_URL}/connections/status?elementIds=${elementIds.join(',')}`
                        );
                        const statuses = await statusResponse.json();

                        // Update nodes with connection statuses
                        setNodes(prevNodes => 
                            prevNodes.map(node => ({
                                ...node,
                                data: {
                                    ...node.data,
                                    connectionStatus: node.data.elementId ? statuses[node.data.elementId] ?? null : null
                                }
                            }))
                        );
                    } catch (error) {
                        console.error('Failed to fetch connection statuses:', error);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, [groupId]);

    const handleNodesChange = (changes: any[]) => {
        changes.forEach((change) => {
            if (change.type === 'select') {
                const node = nodes.find(n => n.id === change.id);
                setSelectedNode(change.selected ? node || null : null);
            }
            if (change.type === 'position' && change.dragging === false) {
                const node = nodes.find(n => n.id === change.id);
                if (node) {
                    updateNode(node.id, {position: change.position}, setNodes)
                        .catch((error) => {
                            console.error('Failed to update node position:', error);
                        });
                }
            }
            if (change.type === 'remove') {
                const node = nodes.find(n => n.id === change.id);
                if (node) {
                    updateNode(node.id, {hidden: true}, setNodes)
                        .then(() => {
                            setSelectedNode(null);
                        })
                        .catch((error) => {
                            console.error('Failed to hide node:', error);
                        });
                }
            }
        });
    };

    const handleConnect = async (connection: any) => {
        console.log('Connecting:', connection);
        const newEdge: BlockEdgeTransferForCreate = {
            source: connection.source,
            target: connection.target,
            groupId: groupId
        };

        try {
            const response = await addEdge(newEdge);
            if (response) {
                setEdges((eds) => [...eds, response]);
            }
        } catch (error) {
            console.error('Failed to add edge:', error);
        }
    };

    const handleEdgesChange = async (changes: any[]) => {
        for (const change of changes) {
            if (change.type === 'remove') {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/graphs/edge/${change.id}`, {
                        method: 'DELETE'
                    });
                    if (response.status === 200) {
                        setEdges((eds) => eds.filter((e) => e.id !== change.id));
                    }
                } catch (error) {
                    console.error('Failed to delete edge:', error);
                }
            }
        }
    };

    return {
        nodes,
        edges,
        selectedNode,
        hiddenNodes,
        selectedHiddenNode,
        setSelectedHiddenNode,
        handleNodesChange,
        handleConnect,
        handleEdgesChange,
        setNodes
    };
}; 