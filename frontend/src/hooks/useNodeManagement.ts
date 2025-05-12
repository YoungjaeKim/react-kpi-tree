import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { BlockNode, BlockEdge } from '../types';
import { getNodesAndElements, updateNode, addEdge } from '../services/nodeService';

export const useNodeManagement = (groupId: string) => {
    const [nodes, setNodes] = useState<BlockNode[]>([]);
    const [edges, setEdges] = useState<BlockEdge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [hiddenNodes, setHiddenNodes] = useState<BlockNode[]>([]);
    const [selectedHiddenNode, setSelectedHiddenNode] = useState<string>("");

    useEffect(() => {
        getNodesAndElements(`${process.env.REACT_APP_API_URL}/graphs?groupId=${groupId}&hidden=false`)
            .then((response) => {
                console.log(`Total nodes: ${response.nodes.length}, Total edges: ${response.edges.length}`);
                setNodes(response.nodes);
                setEdges(response.edges);
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
                    updateNode(node.id, { position: change.position }, setNodes)
                        .catch((error) => {
                            console.error('Failed to update node position:', error);
                        });
                }
            }
            if (change.type === 'remove') {
                const node = nodes.find(n => n.id === change.id);
                if (node) {
                    updateNode(node.id, { hidden: true }, setNodes)
                        .then(() => {
                            setSelectedNode(null);
                            fetchHiddenNodes();
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
        const newEdge: BlockEdge = {
            id: `${connection.source}-${connection.target}`, // Generate a temporary ID
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
        changes.forEach(async (change) => {
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
        });
    };

    const fetchHiddenNodes = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/graphs/node?groupId=${groupId}&hidden=true`);
            const data = await response.json();
            setHiddenNodes(data.nodes);
        } catch (error) {
            console.error('Failed to fetch hidden nodes:', error);
        }
    };

    const makeNodeVisible = async () => {
        if (!selectedHiddenNode) return;
        
        try {
            const response = await updateNode(selectedHiddenNode, { hidden: false }, setNodes);
            if (response) {
                setSelectedHiddenNode("");
                fetchHiddenNodes();
            }
        } catch (error) {
            console.error('Failed to make node visible:', error);
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
        fetchHiddenNodes,
        makeNodeVisible
    };
}; 