import {useCallback, useEffect} from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow';

import 'reactflow/dist/style.css';
import {addEdge, applyEdgeChanges, applyNodeChanges} from "react-flow-renderer";

type BlockEdge = {
    id: string;
    source: string;
    target: string;
};

type BlockNode = {
    id: string;
    position: { x: number; y: number };
    data: { label: string };
};

interface BlockCanvasProps {
    edges: BlockEdge[];
    nodes: BlockNode[];
}

function BlockCanvas(props: BlockCanvasProps) {

    return (
        <ReactFlow
            nodes={props.nodes}
            edges={props.edges}
        >
            <MiniMap/>
            <Controls/>
            <Background/>
        </ReactFlow>
    );
}

export default BlockCanvas;
