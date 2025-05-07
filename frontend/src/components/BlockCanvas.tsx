import {useEffect} from 'react';
import {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlow,
    addEdge,
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

    const onNodesChange = (changes: any[]) => {
        if (props.onNodesChange) {
            props.onNodesChange(changes);
        }
    };

    return (
        <ReactFlow
            nodes={blockNodes}
            edges={blockEdges}
            nodesDraggable={true}
            onConnect={onConnect}
            onNodesChange={onNodesChange}
        >
            <MiniMap/>
            <Controls/>
            <Background/>
        </ReactFlow>
    );
}

export default BlockCanvas;
