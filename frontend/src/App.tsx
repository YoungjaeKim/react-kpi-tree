import React from 'react';
import logo from './logo.svg';
import './App.css';
import BlockCanvas from "./components/BlockCanvas";
import axios from 'axios';
import {useEffect} from "react";
import {useState} from "react";

let blockCanvasSize = {width: 800, height: 800}

// an interface of KpiNode
interface KpiNode {
    id: string,
    position: { x: number, y: number },
    groupId: string,
    data: { label: string, elementId: string },
}

// an interface of KpiEdge
interface KpiEdge {
    id: string,
    source: string,
    target: string,
    groupId: string,
}

// download Nodes and Elements from backend
async function getNodesAndElements() {
    console.log("getNodesAndElements() is called");
    // assign an array of type KpiNode
    let nodes: KpiNode[] = [];
    let edges: KpiEdge[] = [];
    await axios.get('http://localhost:8080/graphs?groupId=507f1f77bcf86cd799439011')
        .then((response) => {
            nodes = response.data["nodes"];
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
    let initialNodes: KpiNode[] = [];
    let initialEdges: KpiEdge[] = [];
    initialNodes = [
        {id: '1', position: {x: 0, y: 0}, groupId: '1', data: {label: '1', elementId: 'response.nodes'}},
        {id: '2', position: {x: 0, y: 100}, groupId: '1', data: {label: '2', elementId: 'response.nodes'}},
    ];

    initialEdges = [{id: 'e1-2', source: '1', target: '2', groupId: '1'}];

    const [nodes, setNodes] = useState<KpiNode[]>(initialNodes);
    const [edges, setEdges] = useState<KpiEdge[]>(initialEdges);

    useEffect(() => {
        getNodesAndElements()
            .then((response) => {
                setNodes([
                    {id: '1', position: {x: 0, y: 0}, groupId: '1', data: {label: '3', elementId: 'response.nodes'}},
                    {id: '2', position: {x: 100, y: 100}, groupId: '1', data: {label: '4', elementId: 'response.nodes'}},
                ]);
                setEdges([{id: 'e1-2', source: '1', target: '2', groupId: '1'}]);
                console.log("getNodesAndElements called");
                // setNodes((nds) =>
                //     nds.map((node) => {
                //         if (node.id === '2') {
                //             // it's important that you create a new object here
                //             // in order to notify react flow about the change
                //             node = {
                //                 ...node,
                //                 position: {x: 100, y: 100},
                //             };
                //
                //             console.log("hit");
                //         }
                //         return node;
                //     })
                // );
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
                    <BlockCanvas nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges}></BlockCanvas>
                </div>
            </header>
        </div>
    );
}

export default App;
