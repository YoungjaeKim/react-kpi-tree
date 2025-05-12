import React, { useEffect, useCallback } from 'react';
import {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    Connection,
    NodeChange,
    EdgeChange
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { BlockNode, BlockEdge } from '../types';

interface BlockCanvasProps {
    edges: BlockEdge[];
    nodes: BlockNode[];
    onConnect?: (connection: Connection) => void;
    onNodesChange?: (changes: NodeChange[]) => void;
    onEdgesChange?: (changes: EdgeChange[]) => void;
}

const BlockCanvas: React.FC<BlockCanvasProps> = ({
    edges,
    nodes,
    onConnect,
    onNodesChange,
    onEdgesChange
}) => {
    // Add minimal style for text color
    const nodesWithStyle = nodes.map(node => ({
        ...node,
        style: { color: '#000' }
    }));

    const [blockNodes, setBlockNodes] = useNodesState(nodesWithStyle as Node[]);
    const [blockEdges, setBlockEdges] = useEdgesState(edges as Edge[]);

    useEffect(() => {
        setBlockNodes(nodesWithStyle as Node[]);
        setBlockEdges(edges as Edge[]);
    }, [nodes, edges, setBlockNodes, setBlockEdges]);

    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setBlockNodes(nds => applyNodeChanges(changes, nds));
            if (onNodesChange) {
                onNodesChange(changes);
            }
        },
        [setBlockNodes, onNodesChange],
    );

    const handleEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setBlockEdges(eds => applyEdgeChanges(changes, eds));
            if (onEdgesChange) {
                onEdgesChange(changes);
            }
        },
        [setBlockEdges, onEdgesChange],
    );

    return (
        <ReactFlow
            nodes={blockNodes}
            edges={blockEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ background: '#f8f8f8' }}
        >
            <MiniMap/>
            <Controls/>
            <Background/>
        </ReactFlow>
    );
};

export default BlockCanvas;
