import React from 'react';
import './App.css';
import BlockCanvas, { BlockEdge, BlockNode, BlockNodeTransferForCreate } from "./components/BlockCanvas";
import axios from 'axios';
import { useEffect } from "react";
import { useState } from "react";
import { addEdge as addReactFlowEdge, Connection, Node } from '@xyflow/react';

let blockCanvasSize = { width: 800, height: 600 }
const API_URL = process.env.REACT_APP_API_URL;

// convert API Node response scheme to BlockNode
function toBlockNode(n: any) {
    const blockNode = {
        id: n.id,
        position: { x: n.position.x, y: n.position.y },
        groupId: n.groupId,
        data: { label: `${n.title} (${n.label})`, elementId: n.elementId },
        hidden: n.hidden ?? false,
        style: {
            background: '#fff',
            border: '1px solid #777',
            borderRadius: 5,
            padding: 10,
            color: '#000',
        }
    } as BlockNode;
    return blockNode;
}

// download Nodes and Elements from backend
async function getNodesAndElements(url: string) {
    console.log("getNodesAndElements() is called");
    // assign an array of type KpiNode
    let nodes: BlockNode[] = [];
    let edges: BlockEdge[] = [];
    await axios.get(url)
        .then((response) => {
            nodes = response.data["nodes"].map((node: any) => {
                return toBlockNode(node);
            });

            edges = response.data["edges"];
        })
        .catch((error) => {
            console.log(error);
        });
    return { nodes: nodes, edges: edges };
}

async function addNode(node: BlockNodeTransferForCreate) {
    console.log("addNode() is called");
    try {
        const response = await axios.post(`${API_URL}/graphs/node`, node);
        return response.data as BlockNode;
    } catch (error) {
        console.log(error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

async function addElement(element: BlockNodeTransferForCreate) {
    console.log("addElement() is called");
    await axios.post(`${API_URL}/graphs/element`, element)
        .then((response) => {
            return response.data as BlockNode;
        })
        .catch((error) => {
            console.log(error);
        });
}

async function addEdge(edge: BlockEdge) {
    console.log("addEdge() is called");
    try {
        const response = await axios.post(`${API_URL}/graphs/edge`, edge);
        return response.data as BlockEdge;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

function App() {
    console.log("App() is called");
    let initialNodes: BlockNode[] = [];
    let initialEdges: BlockEdge[] = [];

    const [nodes, setNodes] = useState<BlockNode[]>(initialNodes);
    const [edges, setEdges] = useState<BlockEdge[]>(initialEdges);
    const [title, setTitle] = useState<string>("");
    const [label, setLabel] = useState<string>("");
    const [groupId, setGroupId] = useState<string>("507f1f77bcf86cd799439011");
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Handle node selection changes
    const handleNodesChange = (changes: any[]) => {
        changes.forEach((change) => {
            // Handle position changes
            if (change.type === 'select') {
                const node = nodes.find(n => n.id === change.id);
                setSelectedNode(change.selected ? node || null : null);
            }
            if (change.type === 'position' && change.dragging === false) {
                const node = nodes.find(n => n.id === change.id);
                if (node) {
                    axios.post(`${API_URL}/graphs/node`, {
                        id: node.id,
                        position: change.position
                    }).catch((error) => {
                        console.error('Failed to update node position:', error);
                    });
                }
            }
            if (change.type === 'remove') {
                const node = nodes.find(n => n.id === change.id);
                if (node) {
                    axios.post(`${API_URL}/graphs/node`, {
                        id: node.id,
                        hidden: true
                    }).then((response) => {
                        if (response.status === 200 || response.status === 201) {
                            // Update local state to remove the node
                            setSelectedNode(null);
                        }
                    }).catch((error) => {
                        console.error('Failed to hide node:', error);
                    });
                }
                // Update local state to remove the node
                setSelectedNode(null);
            }
        });
    };

    const handleConnect = async (connection: Connection) => {
        console.log('Connecting:', connection);
        const newEdge = {
            source: connection.source,
            target: connection.target,
            groupId: groupId
        };

        try {
            // Save to backend first
            const response = await axios.post(`${API_URL}/graphs/edge`, newEdge);
            if (response.status === 200 || response.status === 201) {
                // Only add the edge to ReactFlow's state if the API call was successful
                setEdges((eds) => addReactFlowEdge(connection, eds));
            } else {
                console.error('Failed to add edge: Unexpected status code', response.status);
            }
        } catch (error) {
            console.error('Failed to add edge:', error);
        }
    };

    useEffect(() => {
        getNodesAndElements(`${API_URL}/graphs?groupId=${groupId}`)
            .then((response) => {
                console.log(`Total nodes: ${response.nodes.length}, Total edges: ${response.edges.length}`);
                setNodes(response.nodes);
                setEdges(response.edges);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [groupId]);

    console.log("return calling2");

    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <p>Group ID</p>
                <input type="text" placeholder="Title" value={groupId} onChange={(e) => setGroupId(e.target.value)} />

                <div style={blockCanvasSize}>
                    <BlockCanvas
                        nodes={nodes}
                        edges={edges}
                        onConnect={handleConnect}
                        onNodesChange={handleNodesChange}
                    ></BlockCanvas>
                </div>
                <div>
                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input type="text" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
                    <button onClick={() => {
                        // create new Element, and then add it to the nodes
                        let newNode = {
                            position: { x: 100, y: 100 },
                            groupId: groupId, // Use the default or updated groupId
                            title: title, // Use the title from the input field
                            label: label || title, // Use the label from the input field
                            elementValue: "",
                            elementValueType: "",
                            elementIsActive: true,
                            elementExpression: "",
                            elementId: ""
                        };
                        addNode(newNode).then((node) => {
                            console.log("addNode().then() is called" + node);
                            const blockNode = toBlockNode(node);
                            if (!blockNode.id) {
                                console.error("Node ID is missing. Ensure the backend returns a valid ID.");
                                return;
                            }
                            setNodes([...nodes, blockNode]); // Update BlockCanvas with the new node
                        });
                    }
                    }>Add Node
                    </button>
                </div>
                <button onClick={() => {
                }}>Remove (TBD)
                </button>
            </header>
        </div>
    );
}

export default App;
