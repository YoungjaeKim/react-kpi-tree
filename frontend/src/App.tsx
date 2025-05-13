import React, { useState } from 'react';
import './App.css';
import BlockCanvas from "./components/BlockCanvas";
import { NodeForm } from './components/NodeForm';
import { NodesShowHidePanel } from './components/NodesShowHidePanel';
import { useNodeManagement } from './hooks/useNodeManagement';

const blockCanvasSize = { width: 800, height: 600 };

function App() {
    const [groupId, setGroupId] = useState<string>("507f1f77bcf86cd799439011");
    const {
        nodes,
        edges,
        hiddenNodes,
        selectedHiddenNode,
        setSelectedHiddenNode,
        handleNodesChange,
        handleConnect,
        handleEdgesChange,
        fetchHiddenNodes,
        makeNodeVisible
    } = useNodeManagement(groupId);

    return (
        <div className="App">
            <header className="App-header">
                <p>React KPI Tree</p>
                Group ID
                <input 
                    type="text" 
                    placeholder="Title" 
                    value={groupId} 
                    onChange={(e) => setGroupId(e.target.value)} 
                />

                <div style={blockCanvasSize}>
                    <BlockCanvas
                        nodes={nodes}
                        edges={edges}
                        onConnect={handleConnect}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                    />
                </div>

                <NodeForm 
                    groupId={groupId}
                    onNodeAdded={fetchHiddenNodes}
                />

                <NodesShowHidePanel
                    hiddenNodes={hiddenNodes}
                    selectedHiddenNode={selectedHiddenNode}
                    onSelectedHiddenNodeChange={setSelectedHiddenNode}
                    onRefresh={fetchHiddenNodes}
                    onMakeVisible={makeNodeVisible}
                />
            </header>
        </div>
    );
}

export default App;
