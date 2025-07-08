import React, { useState, useEffect } from 'react';
import { useOnSelectionChange, useNodes } from '@xyflow/react';
import { 
    Paper, Typography, Box, List, ListItem, ListItemText, Divider, IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import { BlockNode } from '../types';
import { EditNodeDialog } from './EditNodeDialog';

interface NodePropertiesPanelProps {
    style?: React.CSSProperties;
    setNodes: React.Dispatch<React.SetStateAction<BlockNode[]>>;
    selectedNodeId: string | null;
    onSelectionChange: (params: { nodes: BlockNode[] }) => void;
    onEditDialogOpenChange: (isOpen: boolean) => void;
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
                    right: 0,
                    marginRight: 2
                }}
                title="Copy content"
            >
                <ContentCopyIcon fontSize="small" />
            </IconButton>
        </ListItem>
    );
};

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({ 
    style, 
    setNodes, 
    selectedNodeId,
    onSelectionChange,
    onEditDialogOpenChange
}) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const nodes = useNodes<BlockNode>();

    // Use the passed selection change handler
    useOnSelectionChange({
        onChange: onSelectionChange,
    });

    const selectedNode = nodes.find(node => node.id === selectedNodeId);

    // Notify parent about dialog state changes
    useEffect(() => {
        onEditDialogOpenChange(editDialogOpen);
    }, [editDialogOpen, onEditDialogOpenChange]);

    // Keep dialog open if the selected node is updated
    useEffect(() => {
        if (selectedNode && editDialogOpen) {
            setEditDialogOpen(true);
        }
    }, [selectedNode, editDialogOpen]);

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
                {selectedNode.data.element?.expression && (
                    <>
                        <PropertyListItem 
                            primary="Expression" 
                            secondary={String(selectedNode.data.element.expression)}
                        />
                        <Divider />
                    </>
                )}
                <PropertyListItem 
                    primary="Connection Type" 
                    secondary={String(selectedNode.data.connectionType)}
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
                nodes={nodes}
            />
        </Paper>
    );
}; 