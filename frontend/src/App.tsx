import React from 'react';
import './App.css';
import BlockCanvas, {BlockEdge, BlockNode, BlockNodeTransferForCreate} from "./components/BlockCanvas";
import axios from 'axios';
import {useEffect} from "react";
import {useState} from "react";

let blockCanvasSize = {width: 800, height: 800}
const API_URL = process.env.REACT_APP_API_URL;

// convert API Node response scheme to BlockNode
function toBlockNode(n: any) {
    return {
        id: n.id,
        position: {x: n.position.x, y: n.position.y},
        groupId: n.groupId,
        data: {label: `${n.title} (${n.label})`, elementId: n.elementId}
    } as BlockNode
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
    return {nodes: nodes, edges: edges};
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
        .catch((error)  => {
            console.log(error);
        });
}

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function App() {
    console.log("App() is called");
    // call getNodesAndElements() to get nodes and edges and then assign them to initialNodes and initialEdges
    let initialNodes: BlockNode[] = [];
    let initialEdges: BlockEdge[] = [];

    const [nodes, setNodes] = useState<BlockNode[]>(initialNodes);
    const [edges, setEdges] = useState<BlockEdge[]>(initialEdges);
    const [title, setTitle] = useState<string>("");
    const [label, setLabel] = useState<string>("");

    useEffect(() => {
        getNodesAndElements(`${API_URL}/graphs?groupId=507f1f77bcf86cd799439011`)
            .then((response) => {
                setNodes(response.nodes);
                setEdges(response.edges);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

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
                <div style={blockCanvasSize}>
                    <BlockCanvas nodes={nodes} edges={edges}></BlockCanvas>
                </div>
                <div>
                    <button onClick={() => {
                        // create new Element, and then add it to the nodes
                        let newNode = {
                            position: {x: 100, y: 100},
                            groupId: "507f1f77bcf86cd799439011",
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
                            setNodes([...nodes, toBlockNode(node)]); // Update BlockCanvas with the new node
                        });
                    }
                    }>Add Node
                    </button>
                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input type="text" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
                </div>
                <button onClick={() => {
                }}>Remove (TBD)
                </button>
            </header>
        </div>
    );
}

export default App;
