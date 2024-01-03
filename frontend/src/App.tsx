import React from 'react';
import logo from './logo.svg';
import './App.css';
import BlockCanvas from "./components/BlockCanvas";
import axios from 'axios';

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
    let initialNodes : any[] = [];
    let initialEdges : any[] = [];
    let initialNodes1: KpiNode[] = [];
    let initialEdges1: KpiEdge[] = [];
    getNodesAndElements().then((response) => {
        initialNodes1 = response.nodes;
        initialEdges1 = response.edges;
        // output as debug log
        console.log("initialNodes: " + initialNodes);
        console.log("initialEdges: " + initialEdges);

        initialNodes = [
            {id: '1', position: {x: 0, y: 0}, data: {label: '1', others1: 2}},
            {id: '2', position: {x: 0, y: 100}, data: {label: '2', others1: 2345345}},
        ];

        initialEdges = [{id: 'e1-2', source: '1', target: '2'}];

    });


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
                    <BlockCanvas nodes={initialNodes} edges={initialEdges}></BlockCanvas>
                </div>
9            </header>
        </div>
    );
}

export default App;
