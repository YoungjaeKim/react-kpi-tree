import React from 'react';
import { Select, MenuItem, IconButton, FormControl, InputLabel, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BlockNode } from '../types';

interface NodesShowHidePanelProps {
    hiddenNodes: BlockNode[];
    selectedHiddenNode: string;
    onSelectedHiddenNodeChange: (nodeId: string) => void;
    onRefresh: () => void;
    onMakeVisible: (nodeId: string) => void;
}

export const NodesShowHidePanel: React.FC<NodesShowHidePanelProps> = ({
    hiddenNodes,
    selectedHiddenNode,
    onSelectedHiddenNodeChange,
    onRefresh,
}) => {
    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl fullWidth>
                <InputLabel id="hidden-node-select-label">Select Hidden Node ({hiddenNodes.length} items)</InputLabel>
                <Select
                    labelId="hidden-node-select-label"
                    value={selectedHiddenNode}
                    label={`Select Hidden Node (${hiddenNodes.length} items)`}
                    onChange={(e) => onSelectedHiddenNodeChange(e.target.value)}
                >
                    <MenuItem value="">
                        <em>Select Hidden Node ({hiddenNodes.length} items)</em>
                    </MenuItem>
                    {hiddenNodes.map((node) => (
                        <MenuItem key={node.id} value={node.id}>
                            {node.data.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <IconButton 
                onClick={onRefresh}
                title="Refresh hidden nodes"
                sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        bgcolor: 'primary.dark',
                    }
                }}
            >
                <RefreshIcon />
            </IconButton>
        </Box>
    );
}; 