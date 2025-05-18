import React, { useState, useCallback, useEffect } from 'react';
import { useOnSelectionChange, useNodes } from '@xyflow/react';
import { 
    Paper, Typography, Box, List, ListItem, ListItemText, Divider, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    CircularProgress, Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import { BlockNode } from '../types';
import axios from 'axios';
import { updateNode } from '../services/blockGraphService';

interface NodePropertiesPanelProps {
    style?: React.CSSProperties;
    setNodes: React.Dispatch<React.SetStateAction<BlockNode[]>>;
}

interface PropertyListItemProps {
    primary: string;
    secondary: string;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ primary, secondary }) => {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <ListItem
            sx={{
                '&:hover .copy-button': {
                    opacity: 1,
                },
            }}
        >
            <ListItemText 
                primary={primary} 
                secondary={secondary}
            />
            <IconButton
                className="copy-button"
                size="small"
                onClick={() => handleCopy(secondary)}
                sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    position: 'absolute',
                    right: 8,
                    marginRight: 2
                }}
                title="Copy content"
            >
                <ContentCopyIcon fontSize="small" />
            </IconButton>
        </ListItem>
    );
};

interface EditNodeDialogProps {
    open: boolean;
    onClose: () => void;
    node: BlockNode;
    setNodes: React.Dispatch<React.SetStateAction<BlockNode[]>>;
}

const EditNodeDialog: React.FC<EditNodeDialogProps> = ({ open, onClose, node, setNodes }) => {
    const [title, setTitle] = useState(node.data.title || '');
    const [label, setLabel] = useState(node.data.label || '');
    const [kpiValue, setKpiValue] = useState(node.data.element?.kpiValue || '');
    const [kpiValueType, setKpiValueType] = useState(node.data.element?.kpiValueType || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update form values when node changes
    useEffect(() => {
        setTitle(node.data.title || '');
        setLabel(node.data.label || '');
        setKpiValue(node.data.element?.kpiValue || '');
        setKpiValueType(node.data.element?.kpiValueType || '');
        setError(null);
    }, [node]);

    const validateKpiValue = (value: string, type: string): boolean => {
        switch (type.toLowerCase()) {
            case 'integer':
                return Number.isInteger(Number(value));
            case 'double':
                return !isNaN(Number(value));
            case 'string':
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const promises = [];

            if (title !== node.data.title || label !== node.data.label) {
                promises.push(
                    updateNode(node.id, {
                        title,
                        label
                    }, setNodes)
                );
            }

            if (kpiValue !== node.data.element?.kpiValue) {
                const valueType = node.data.element?.kpiValueType || 'String';
                if (!validateKpiValue(kpiValue, valueType)) {
                    setError(`${kpiValue} is not ${valueType}`);
                    setLoading(false);
                    return;
                }

                promises.push(
                    axios.post(`${process.env.REACT_APP_API_URL}/elements`, {
                        id: node.data.elementId,
                        kpiValue
                    })
                );
            }

            await Promise.all(promises);
            onClose();
        } catch (err) {
            setError('Failed to update node');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Node</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        fullWidth
                    />
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography>{node.data.element?.kpiValueType || 'String'}</Typography>
                        <TextField
                            label="KPI Value"
                            value={kpiValue}
                            onChange={(e) => setKpiValue(e.target.value)}
                            fullWidth
                        />
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({ style, setNodes }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const nodes = useNodes<BlockNode>();

    const onSelectionChange = useCallback(({ nodes }: { nodes: BlockNode[] }) => {
        // Only take the last selected node
        setSelectedNodeId(nodes.length > 0 ? nodes[nodes.length - 1].id : null);
    }, []);

    useOnSelectionChange({
        onChange: onSelectionChange,
    });

    const selectedNode = nodes.find(node => node.id === selectedNodeId);

    if (!selectedNode) {
        return (
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 2, 
                    width: 300,
                    height: '100%',
                    ...style
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Node Properties
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Select a node to view its properties
                </Typography>
            </Paper>
        );
    }

    const formatPosition = (value: any) => {
        if (typeof value === 'number') {
            return value.toFixed(2);
        }
        return 'undefined';
    };

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: 2, 
                width: 300,
                height: '100%',
                overflow: 'auto',
                ...style
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                    Node Properties
                </Typography>
                <IconButton 
                    onClick={() => setEditDialogOpen(true)}
                    title="Edit node"
                    size="small"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>
            <List>
                <PropertyListItem 
                    primary="ID" 
                    secondary={String(selectedNode.id)}
                />
                <Divider />
                <PropertyListItem 
                    primary="Title" 
                    secondary={String(selectedNode.data.title)}
                />
                <Divider />
                <PropertyListItem 
                    primary="Label" 
                    secondary={String(selectedNode.data.label)}
                />
                <Divider />
                <PropertyListItem 
                    primary="Element ID" 
                    secondary={String(selectedNode.data.elementId)}
                />
                <Divider />
                <PropertyListItem 
                    primary="KPI ValueType" 
                    secondary={String(selectedNode.data.element?.kpiValueType)}
                />
                <Divider />
                <PropertyListItem 
                    primary="KPI Value" 
                    secondary={String(selectedNode.data.element?.kpiValue)}
                />
                <Divider />
                <PropertyListItem 
                    primary="Connection Status" 
                    secondary={String(selectedNode.data.connectionStatus)}
                />
                <Divider />
                <PropertyListItem 
                    primary="Group ID" 
                    secondary={String(selectedNode.groupId)}
                />
                <Divider />
                <PropertyListItem 
                    primary="Position" 
                    secondary={`X: ${formatPosition(selectedNode.position?.x)}, Y: ${formatPosition(selectedNode.position?.y)}`}
                />
                <Divider />
                <PropertyListItem 
                    primary="Hidden" 
                    secondary={selectedNode.hidden ? 'Yes' : 'No'}
                />
                <Divider />
                <PropertyListItem 
                    primary="Node Type" 
                    secondary={selectedNode.type || 'default'}
                />
            </List>
            <EditNodeDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                node={selectedNode}
                setNodes={setNodes}
            />
        </Paper>
    );
}; 