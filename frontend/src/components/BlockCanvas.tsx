import {useEffect} from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow';

import 'reactflow/dist/style.css';

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
};

interface BlockCanvasProps {
    edges: BlockEdge[];
    nodes: BlockNode[];
}

function BlockCanvas(props: BlockCanvasProps) {

    const [blockNodes, setBlockNodes] = useNodesState(props.nodes);
    const [blockEdges, setBlockEdges] = useEdgesState(props.edges);

    useEffect(() => {
        setBlockNodes(props.nodes);
        setBlockEdges(props.edges);
    }, [props.nodes, props.edges, setBlockNodes, setBlockEdges]);

    return (
        <ReactFlow
            nodes={blockNodes}
            edges={blockEdges}
            nodesDraggable={true}
        >
            <MiniMap/>
            <Controls/>
            <Background/>
        </ReactFlow>
    );
}

export default BlockCanvas;
