import { useCallback } from 'react';
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
    setNodes: any;
    setEdges: any;
}

function BlockCanvas(props: BlockCanvasProps) {
    // const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
    // const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges);
    const onNodesChange = useCallback((changes: any) => {
        // Update nodes state based on changes
        props.setNodes((prevNodes: any) => applyNodeChanges(changes, prevNodes));
    }, [props.setNodes]);

    const onEdgesChange = useCallback((changes: any) => {
        // Update edges state based on changes
        props.setEdges((prevEdges: any) => applyEdgeChanges(changes, prevEdges));
    }, [props.setEdges]);

    const onConnect = useCallback((params: any) => props.setEdges((eds:any) => addEdge(params, eds)), [props.setEdges]);

    return (
        <ReactFlow
            nodes={props.nodes}
            edges={props.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
        >
            <MiniMap />
            <Controls />
            <Background />
        </ReactFlow>
    );
}

export default BlockCanvas;
