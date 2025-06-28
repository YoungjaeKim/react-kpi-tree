import axios from 'axios';
import { BlockNode, BlockEdge, BlockNodeTransferForCreate, BlockEdgeTransferForCreate } from '../types';
import { toBlockNode } from '../utils/nodeUtils';

const API_URL = process.env.REACT_APP_API_URL;

// Expression calculation utilities
export function parseExpression(expression: string, nodes: BlockNode[]): string {
    if (!expression) return '';
    
    // Replace @{elementId} references with actual values
    let parsedExpression = expression;
    const elementRefRegex = /@\{([^}]+)\}/g;
    
    parsedExpression = parsedExpression.replace(elementRefRegex, (match, elementId) => {
        const targetNode = nodes.find(node => node.data.elementId === elementId);
        if (targetNode && targetNode.data.element?.kpiValue) {
            return targetNode.data.element.kpiValue;
        }
        return '0'; // Default to 0 if element not found or no value
    });
    
    return parsedExpression;
}

export function calculateExpression(expression: string, nodes: BlockNode[]): number | null {
    if (!expression) return null;
    
    try {
        const parsedExpression = parseExpression(expression, nodes);
        
        // Validate the expression contains only allowed characters
        const allowedChars = /^[0-9+\-*/().\s]+$/;
        if (!allowedChars.test(parsedExpression)) {
            console.error('Invalid characters in expression:', parsedExpression);
            return null;
        }
        
        // Create a safe evaluation function
        const safeEval = (expr: string): number => {
            // Remove any potential security risks
            const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
            
            // Use Function constructor instead of eval for better security
            const calculate = new Function('return ' + sanitized);
            return calculate();
        };
        
        const result = safeEval(parsedExpression);
        return isNaN(result) ? null : result;
    } catch (error) {
        console.error('Error calculating expression:', error);
        return null;
    }
}

export function getExpressionDependencies(expression: string): string[] {
    if (!expression) return [];
    
    const dependencies: string[] = [];
    const elementRefRegex = /@\{([^}]+)\}/g;
    let match;
    
    while ((match = elementRefRegex.exec(expression)) !== null) {
        dependencies.push(match[1]);
    }
    
    return dependencies;
}

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

export async function addNode(node: BlockNodeTransferForCreate) : Promise<BlockNode> {
    console.log("addNode() is called");
    try {
        const response = await axios.post(`${API_URL}/graphs/node`, node);
        return toBlockNode(response.data);
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

export async function updateNode(
    id: string, 
    updates: { 
        position?: { x: number, y: number }, 
        hidden?: boolean,
        title?: string,
        label?: string
    }, 
    setNodes?: React.Dispatch<React.SetStateAction<BlockNode[]>>
) {
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
        return toBlockNode(response.data);
    } catch (error) {
        console.error('Failed to update node:', error);
        throw error;
    }
} 