import React, { useState } from 'react';
import './App.css';
import BlockCanvas from "./components/BlockCanvas";
import { NodeForm } from './components/NodeForm';
import { NodesShowHidePanel } from './components/NodesShowHidePanel';
import { NodePropertiesPanel } from './components/NodePropertiesPanel';
import { ReactFlowProvider } from '@xyflow/react';
import { useNodeManagement } from './hooks/useNodeManagement';
import { 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    IconButton,
    Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const blockCanvasSize = { width: 1000, height: 600 };

interface CreateGroupDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (title: string) => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ open, onClose, onConfirm }) => {
    const [title, setTitle] = useState('');

    const handleConfirm = () => {
        if (title.trim()) {
            onConfirm(title.trim());
            setTitle('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Create a Group
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Title"
                    type="text"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={!title.trim()}>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};

function App() {
    const [groupId, setGroupId] = useState<string>("507f1f77bcf86cd799439011");
    const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
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

    const handleCreateGroup = async (title: string) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/graphs/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create group');
            }
            
            // You might want to refresh the node data here
            console.log('Group created successfully');
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <p>React KPI Tree</p>
                <Stack direction="row" spacing={2} alignItems="center">
                    <div>Group ID</div>
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={groupId} 
                        onChange={(e) => setGroupId(e.target.value)} 
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateGroupDialogOpen(true)}
                    >
                        Create Group
                    </Button>
                </Stack>

                <ReactFlowProvider>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={blockCanvasSize}>
                            <BlockCanvas
                                nodes={nodes}
                                edges={edges}
                                onConnect={handleConnect}
                                onNodesChange={handleNodesChange}
                                onEdgesChange={handleEdgesChange}
                            />
                        </div>
                        <NodePropertiesPanel style={{ height: blockCanvasSize.height }} />
                    </div>
                </ReactFlowProvider>

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

            <CreateGroupDialog
                open={createGroupDialogOpen}
                onClose={() => setCreateGroupDialogOpen(false)}
                onConfirm={handleCreateGroup}
            />
        </div>
    );
}

export default App;
