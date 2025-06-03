import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import BlockCanvas from "./components/BlockCanvas";
import { NodePropertiesPanel } from './components/NodePropertiesPanel';
import { ReactFlowProvider } from '@xyflow/react';
import { useBlockGraph } from './hooks/useBlockGraph';
import { BlockNode } from './types';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Stack,
    Autocomplete,
    Typography,
    Box,
    Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddNodeDialog } from './components/AddNodeDialog';
import KpiDisplayNodeType from './components/KpiDisplayNodeType';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Minimum screen resolution
const MIN_SCREEN_WIDTH = 1280;
const MIN_SCREEN_HEIGHT = 1024;
// Default properties panel width
const DEFAULT_PROPERTIES_WIDTH = 300;

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

const nodeTypes = { kpiDisplayNodeType: KpiDisplayNodeType };

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
    const [addNodeDialogOpen, setAddNodeDialogOpen] = useState(false);
    const [propertiesWidth, setPropertiesWidth] = useState(DEFAULT_PROPERTIES_WIDTH);
    const [isPropertiesExpanded, setIsPropertiesExpanded] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const {
        nodes,
        edges,
        handleNodesChange,
        handleConnect,
        handleEdgesChange,
        setNodes
    } = useBlockGraph(selectedGroup?.id || '');

    // Handle node selection changes
    const handleSelectionChange = useCallback(({ nodes }: { nodes: BlockNode[] }) => {
        setSelectedNodeId(nodes.length > 0 ? nodes[nodes.length - 1].id : null);
    }, []);

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

    const handleArchiveGroup = async (groupId: string) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/graphs/group/${groupId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ archived: true }),
            });

            if (!response.ok) {
                throw new Error('Failed to archive group');
            }

            // Refresh the groups list after archiving
            await fetchGroups();
            // If the archived group was selected, clear the selection
            if (selectedGroup?.id === groupId) {
                setSelectedGroup(null);
            }
        } catch (error) {
            console.error('Error archiving group:', error);
        }
    };

    const togglePropertiesPanel = () => {
        setIsPropertiesExpanded(!isPropertiesExpanded);
    };

    return (
        <WebSocketProvider>
            <div className="App" style={{ minWidth: MIN_SCREEN_WIDTH, minHeight: MIN_SCREEN_HEIGHT, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header Section */}
                <header className="App-header" style={{ 
                    padding: '16px 24px',
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#fff'
                }}>
                    <div style={{ 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                    }}>
                        <Typography variant="h5" component="h1">
                            React KPI Tree
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Autocomplete
                                value={selectedGroup}
                                onChange={(event, newValue) => setSelectedGroup(newValue)}
                                options={groups}
                                getOptionLabel={(option) => option ? `${option.title} (nodes: ${option.nodeCount})` : ""}
                                sx={{ width: 300 }}
                                renderOption={(props, option) => (
                                    <li {...props} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{option.title} (nodes: {option.nodeCount})</span>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleArchiveGroup(option.id);
                                            }}
                                            sx={{
                                                visibility: 'hidden',
                                                '.MuiAutocomplete-option:hover &': {
                                                    visibility: 'visible'
                                                }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Select a Group"
                                    />
                                )}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateGroupDialogOpen(true)}
                                size="small"
                            >
                                Create Group
                            </Button>
                        </Stack>
                    </div>
                </header>

                {/* Main Content Section */}
                <main style={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    height: 0,
                    overflow: 'hidden',
                    padding: '24px'
                }}>
                    {/* Canvas and Properties Section */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '24px',
                        flex: 1,
                        minHeight: 0,
                        position: 'relative',
                    }}>
                        <ReactFlowProvider>
                            {/* Canvas Section */}
                            <div style={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                minWidth: 0,
                                position: 'relative',
                                height: '100%'
                            }}>
                                <div style={{ 
                                    flex: 1,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    minHeight: 0,
                                    position: 'relative',
                                    background: '#fff',
                                    height: '100%'
                                }}>
                                    <BlockCanvas
                                        nodes={nodes}
                                        edges={edges}
                                        onConnect={handleConnect}
                                        onNodesChange={handleNodesChange}
                                        onEdgesChange={handleEdgesChange}
                                        nodeTypes={nodeTypes}
                                    />
                                    {/* Floating Add Node Button */}
                                    {selectedGroup && (
                                        <Fab
                                            color="primary"
                                            aria-label="add"
                                            onClick={() => setAddNodeDialogOpen(true)}
                                            title="Add a Node"
                                            sx={{
                                                position: 'absolute',
                                                top: 16,
                                                right: isPropertiesExpanded ? 16 : 48,
                                                zIndex: 2,
                                                transition: 'right'
                                            }}
                                        >
                                            <AddIcon />
                                        </Fab>
                                    )}
                                    {/* Collapsed Properties Panel Button */}
                                    {!isPropertiesExpanded && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '10%',
                                                right: 0,
                                                transform: 'translateY(-50%)',
                                                zIndex: 3,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                background: '#fff',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px 0 0 8px',
                                                boxShadow: 1,
                                                px: 1,
                                                py: 2
                                            }}
                                            onClick={togglePropertiesPanel}
                                        >
                                            <ChevronLeftIcon />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    writingMode: 'vertical-rl',
                                                    textOrientation: 'mixed',
                                                    letterSpacing: '0.1em',
                                                    mt: 1
                                                }}
                                            >
                                                Node Properties
                                            </Typography>
                                        </Box>
                                    )}
                                </div>
                            </div>

                            {/* Properties Panel */}
                            <Box sx={{
                                width: isPropertiesExpanded ? propertiesWidth : 0,
                                transition: 'width 0.3s ease',
                                position: 'relative',
                                border: isPropertiesExpanded ? '1px solid #e0e0e0' : 'none',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                minWidth: 0,
                                background: '#fff',
                                boxShadow: isPropertiesExpanded ? 1 : 'none',
                                display: isPropertiesExpanded ? 'block' : 'none',
                            }}>
                                {isPropertiesExpanded && (
                                    <IconButton
                                        onClick={togglePropertiesPanel}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            zIndex: 1,
                                            backgroundColor: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                            }
                                        }}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                )}
                                <NodePropertiesPanel 
                                    style={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                    setNodes={setNodes}
                                    selectedNodeId={selectedNodeId}
                                    onSelectionChange={handleSelectionChange}
                                    onEditDialogOpenChange={setIsEditDialogOpen}
                                />
                            </Box>
                        </ReactFlowProvider>
                    </div>
                </main>

                {/* Dialogs */}
                <AddNodeDialog
                    open={addNodeDialogOpen}
                    onClose={() => setAddNodeDialogOpen(false)}
                    groupId={selectedGroup?.id || ''}
                    onNodeAdded={(node) => {
                        // Refresh the graph data after a node is added
                        // handleNodesChange([]);
                    }}
                    setNodes={setNodes}
                />

                <CreateGroupDialog
                    open={createGroupDialogOpen}
                    onClose={() => setCreateGroupDialogOpen(false)}
                    onConfirm={handleCreateGroup}
                />
            </div>
        </WebSocketProvider>
    );
}

export default App;
