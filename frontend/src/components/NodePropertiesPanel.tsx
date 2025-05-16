import React, { useState, useCallback } from 'react';
import { useOnSelectionChange, useNodes } from '@xyflow/react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import { BlockNode } from '../types';

interface NodePropertiesPanelProps {
    style?: React.CSSProperties;
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({ style }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
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
            <Typography variant="h6" gutterBottom>
                Node Properties
            </Typography>
            <List>
                <ListItem>
                    <ListItemText 
                        primary="ID" 
                        secondary={String(selectedNode.id)}
                    />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText 
                        primary="Label" 
                        secondary={String(selectedNode.data.label)}
                    />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText 
                        primary="Element ID" 
                        secondary={String(selectedNode.data.elementId)}
                    />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText 
                        primary="Group ID" 
                        secondary={String(selectedNode.groupId)}
                    />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText 
                        primary="Position" 
                        secondary={`X: ${formatPosition(selectedNode.position?.x)}, Y: ${formatPosition(selectedNode.position?.y)}`}
                    />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText 
                        primary="Hidden" 
                        secondary={selectedNode.hidden ? 'Yes' : 'No'}
                    />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText 
                        primary="Type" 
                        secondary={selectedNode.type || 'default'}
                    />
                </ListItem>
            </List>
        </Paper>
    );
}; 