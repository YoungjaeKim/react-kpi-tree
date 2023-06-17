import { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';

import 'reactflow/dist/style.css';

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
    const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
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
