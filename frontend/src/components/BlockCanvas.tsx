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
    EdgeChange,
    NodeTypes
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { BlockNode, BlockEdge } from '../types';
import KpiDisplayNodeType from './KpiDisplayNodeType';

interface BlockCanvasProps {
    edges: BlockEdge[];
    nodes: BlockNode[];
    onConnect?: (connection: Connection) => void;
    onNodesChange?: (changes: NodeChange[]) => void;
    onEdgesChange?: (changes: EdgeChange[]) => void;
    nodeTypes: NodeTypes;
}

const BlockCanvas: React.FC<BlockCanvasProps> = ({
    edges,
    nodes,
    onConnect,
    onNodesChange,
    onEdgesChange,
    nodeTypes
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

    // Create custom node types with nodes prop
    const customNodeTypes: NodeTypes = {
        ...nodeTypes,
        kpiDisplayNodeType: (props: any) => (
            <KpiDisplayNodeType {...props} nodes={nodes} />
        )
    };

    return (
        <ReactFlow
            nodes={blockNodes}
            edges={blockEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ background: '#f8f8f8' }}
            nodeTypes={customNodeTypes}
        >
            <MiniMap/>
            <Controls/>
            <Background/>
        </ReactFlow>
    );
};

export default BlockCanvas;
