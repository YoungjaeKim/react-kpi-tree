import {useEffect, useCallback} from 'react';
import {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlow,
    addEdge,
    applyNodeChanges,
    Connection,
    Edge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

export type BlockEdge = {
    id: string;
    source: string;
    target: string;
    groupId: string;
};

export type BlockNodeTransferForCreate = {
    position: { x: number; y: number };
    groupId: string;
    title: string;
    label: string;
    elementValue: string;
    elementValueType: string;
    elementIsActive: boolean;
    elementExpression: string;
    elementId: string;
};

export type BlockNode = {
    id: string;
    position: { x: number; y: number };
    groupId: string;
    data: { label: string, elementId: string };
    hidden: boolean;
    style?: {
        background: string;
        border: string;
        borderRadius: number;
        padding: number;
        color: string;
    };
};

interface BlockCanvasProps {
    edges: BlockEdge[];
    nodes: BlockNode[];
    onConnect?: (connection: Connection) => void;
    onNodesChange?: (changes: any[]) => void;
}

   
function BlockCanvas(props: BlockCanvasProps) {
    const [blockNodes, setBlockNodes] = useNodesState(props.nodes);
    const [blockEdges, setBlockEdges] = useEdgesState(props.edges);

    useEffect(() => {
        setBlockNodes(props.nodes);
        setBlockEdges(props.edges);
    }, [props.nodes, props.edges, setBlockNodes, setBlockEdges]);

    const onConnect = (params: Connection) => {
        if (props.onConnect) {
            props.onConnect(params);
        }
    };

    // ref; https://reactflow.dev/learn/concepts/core-concepts#controlled-or-uncontrolled
    const onNodesChange = useCallback(
        (changes: any[]) => setBlockNodes((nds: any[]) => applyNodeChanges(changes, nds)),
        [setBlockNodes],
      );

    return (
        <ReactFlow
            nodes={blockNodes}
            edges={blockEdges}
            onNodesChange={onNodesChange}
            onConnect={onConnect}
            fitView
            style={{ background: '#f8f8f8' }}
        >
            <MiniMap/>
            <Controls/>
            <Background/>
        </ReactFlow>
    );
}

export default BlockCanvas;
