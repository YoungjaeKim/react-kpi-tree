import React from 'react';
import logo from './logo.svg';
import './App.css';
import BlockCanvas from "./components/BlockCanvas";
import axios from 'axios';

let blockCanvasSize = {width: 800, height: 800}

async function download(){
  const response = await axios.get("http://localhost:3000/elements");
}

function App() {
  let initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  ];

  let initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
      </header>
    </div>
  );
}

export default App;
