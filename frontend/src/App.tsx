import React from 'react';
import logo from './logo.svg';
import './App.css';
import BlockCanvas, {BlockEdge, BlockNode} from "./components/BlockCanvas";
import axios from 'axios';
import {useEffect} from "react";
import {useState} from "react";

let blockCanvasSize = {width: 800, height: 800}


// download Nodes and Elements from backend
async function getNodesAndElements() {
    console.log("getNodesAndElements() is called");
    // assign an array of type KpiNode
    let nodes: BlockNode[] = [];
    let edges: BlockEdge[] = [];
    await axios.get('http://localhost:8080/graphs?groupId=507f1f77bcf86cd799439011')
        .then((response) => {
            nodes=response.data["nodes"].map((node: any) => {
                return {
                    id: node.id,
                    position: {x: node.position.x, y: node.position.y},
                    groupId: node.groupId,
                    data: {label: `${node.title} (${node.label})`, elementId: node.elementId}
                }
            });

            edges = response.data["edges"];
        })
        .catch((error) => {
            console.log(error);
        });
    return {nodes: nodes, edges: edges};
}

function App() {
    console.log("App() is called");
    // call getNodesAndElements() to get nodes and edges and then assign them to initialNodes and initialEdges
    let initialNodes: BlockNode[] = [];
    let initialEdges: BlockEdge[] = [];

    const [nodes, setNodes] = useState<BlockNode[]>(initialNodes);
    const [edges, setEdges] = useState<BlockEdge[]>(initialEdges);

    useEffect(() => {
        getNodesAndElements()
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
                <img src={logo} className="App-logo" alt="logo"/>
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
            </header>
        </div>
    );
}

export default App;
