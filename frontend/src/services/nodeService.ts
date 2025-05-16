import axios from 'axios';
import { BlockNode, BlockEdge, BlockNodeTransferForCreate, BlockEdgeTransferForCreate } from '../types';
import { toBlockNode } from '../utils/nodeUtils';

const API_URL = process.env.REACT_APP_API_URL;

export async function getNodesAndElements(url: string) {
    console.log("getNodesAndElements() is called");
    let nodes: BlockNode[] = [];
    let edges: BlockEdge[] = [];
    await axios.get(url)
        .then((response) => {
            nodes = response.data["nodes"].map((node: any) => toBlockNode(node));
            edges = response.data["edges"];
        })
        .catch((error) => {
            console.log(error);
        });
    return { nodes: nodes, edges: edges };
}

export async function addNode(node: BlockNodeTransferForCreate) {
    console.log("addNode() is called");
    try {
        const response = await axios.post(`${API_URL}/graphs/node`, node);
        return response.data as BlockNode;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function addElement(element: BlockNodeTransferForCreate) {
    console.log("addElement() is called");
    await axios.post(`${API_URL}/graphs/element`, element)
        .then((response) => {
            return response.data as BlockNode;
        })
        .catch((error) => {
            console.log(error);
        });
}

export async function addEdge(edge: BlockEdgeTransferForCreate) {
    console.log("addEdge() is called");
    try {
        const response = await axios.post(`${API_URL}/graphs/edge`, edge);
        return response.data as BlockEdge;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function updateNode(id: string, updates: { position?: { x: number, y: number }, hidden?: boolean }, setNodes?: React.Dispatch<React.SetStateAction<BlockNode[]>>) {
    console.log("updateNode() is called");
    try {
        const response = await axios.post(`${API_URL}/graphs/node`, {
            id,
            ...updates
        });
        if ((response.status === 200 || response.status === 201) && setNodes) {
            setNodes(prevNodes => 
                prevNodes.map(node => 
                    node.id === id ? toBlockNode(response.data) : node
                )
            );
        }
        return response.data;
    } catch (error) {
        console.error('Failed to update node:', error);
        throw error;
    }
} 