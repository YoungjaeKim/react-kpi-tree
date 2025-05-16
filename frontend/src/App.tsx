import React, { useState, useEffect } from 'react';
import './App.css';
import BlockCanvas from "./components/BlockCanvas";
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
    Stack,
    Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { NodeManagementDialog } from './components/NodeManagementDialog';

const blockCanvasSize = { width: 1000, height: 600 };

interface Group {
    id: string;
    title: string;
    nodeCount: number;
    edgeCount: number;
    archived: boolean;
    timestamp: Date;
}

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
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
    const [nodeManagementDialogOpen, setNodeManagementDialogOpen] = useState(false);
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
    } = useNodeManagement(selectedGroup?.id || '');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/graphs/group?archived=false`);
            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

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

            // Refresh the groups list after creating a new one
            await fetchGroups();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <div style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0 20px'
                }}>
                    <p>React KPI Tree</p>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <div>Group</div>
                            <Autocomplete
                                value={selectedGroup}
                                onChange={(event, newValue) => {
                                    setSelectedGroup(newValue);
                                }}
                                options={groups}
                                getOptionLabel={(option) => `${option.title} (nodes: ${option.nodeCount})`}
                                sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateGroupDialogOpen(true)}
                            >
                                Create Group
                            </Button>
                        </Stack>

                    </div>
                </div>
                <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setNodeManagementDialogOpen(true)}
                            disabled={!selectedGroup}
                        >
                            Add Node
                        </Button>
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

                <NodeManagementDialog
                    open={nodeManagementDialogOpen}
                    onClose={() => setNodeManagementDialogOpen(false)}
                    groupId={selectedGroup?.id || ''}
                    hiddenNodes={hiddenNodes}
                    selectedHiddenNode={selectedHiddenNode}
                    onSelectedHiddenNodeChange={setSelectedHiddenNode}
                    onRefresh={fetchHiddenNodes}
                    onMakeVisible={makeNodeVisible}
                    onNodeAdded={fetchHiddenNodes}
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
