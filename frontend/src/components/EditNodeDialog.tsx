import React, {useState, useEffect} from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    CircularProgress, Alert, Box, Typography, Divider
} from '@mui/material';
import {BlockNode} from '../types';
import axios from 'axios';
import {updateNode} from '../services/blockGraphService';
import {ExternalConnectionSettings} from './ExternalConnectionSettings';
import {toBlockNode} from '../utils/nodeUtils';

interface EditNodeDialogProps {
    open: boolean;
    onClose: () => void;
    node: BlockNode;
    setNodes: React.Dispatch<React.SetStateAction<BlockNode[]>>;
}

export const EditNodeDialog: React.FC<EditNodeDialogProps> = ({open, onClose, node, setNodes}) => {
    const [title, setTitle] = useState(node.data.title || '');
    const [label, setLabel] = useState(node.data.label || '');
    const [kpiValue, setKpiValue] = useState(node.data.element?.kpiValue || '');
    const [kpiValueType, setKpiValueType] = useState(node.data.element?.kpiValueType || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [getConnectionData, setGetConnectionData] = useState<(() => any) | null>(null);

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

    const handleConnectionChange = (getter: () => any) => {
        setGetConnectionData(() => getter);
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

            // Handle connection changes
            if (getConnectionData) {
                const connectionData = getConnectionData();
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/connections?elementId=${node.data.elementId}`, {
                        validateStatus: (status) => status < 500
                    });

                    console.log("Connection status:", response.status);
                    if (response.status === 200) { // Connection exists on server
                        if (!connectionData) {
                            // No connection data provided, disable existing connection
                            console.log("condition 1: Disable existing connection");
                            promises.push(
                                axios.post(`${process.env.REACT_APP_API_URL}/connections`, {
                                    elementId: node.data.elementId,
                                    enable: false
                                })
                            );
                        } else {
                            // Connection data provided, update with enable state from data
                            console.log("condition 2: Update connection with data");
                            promises.push(
                                axios.post(`${process.env.REACT_APP_API_URL}/connections`, {
                                    elementId: node.data.elementId,
                                    ...connectionData
                                })
                            );
                        }
                    } else if (response.status === 404 && connectionData) {
                        // No existing connection but new connection data provided
                        console.log("condition 3: Create new connection");
                        promises.push(
                            axios.post(`${process.env.REACT_APP_API_URL}/connections`, {
                                elementId: node.data.elementId,
                                ...connectionData
                            })
                        );
                    } else {
                        console.log("condition 4: No action needed");
                        // No existing connection and no new connection data
                    }
                } catch (err) {
                    console.error("Unexpected error:", err);
                    setError('An unexpected error occurred');
                    setLoading(false);
                    return;
                }
            }

            await Promise.all(promises);
            
            // Update the local state with the new node data
            const updatedNode = await axios.get(`${process.env.REACT_APP_API_URL}/graphs/node/${node.id}`);
            console.log("updatedNode", updatedNode);
            setNodes(prevNodes => 
                prevNodes.map(n => n.id === node.id ? toBlockNode(updatedNode.data) : n)
            );
            
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
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2}}>
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
                    <Divider/>
                    <TextField
                        label={`KPI Value (${node.data.element?.kpiValueType || 'String'})`}
                        value={kpiValue}
                        onChange={(e) => setKpiValue(e.target.value)}
                        fullWidth
                    />
                    <Divider/>

                    <Typography variant="h6">External Connection</Typography>
                    <ExternalConnectionSettings
                        elementId={node.data.elementId}
                        connectionStatus={node.data.connectionStatus ?? null}
                        onConnectionChange={handleConnectionChange}
                    />

                    {error && (
                        <Alert severity="error" sx={{mt: 2}}>
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
                    startIcon={loading ? <CircularProgress size={20}/> : null}
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 