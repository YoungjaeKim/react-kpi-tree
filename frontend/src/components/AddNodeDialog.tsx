import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { NewNodeForm } from './NewNodeForm';
import { NodesShowHidePanel } from './NodesShowHidePanel';
import { BlockNode } from '../types';

interface AddNodeDialogProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    hiddenNodes: BlockNode[];
    selectedHiddenNode: string;
    onSelectedHiddenNodeChange: (nodeId: string) => void;
    onRefresh: () => void;
    onMakeVisible: (nodeId: string) => void;
    onNodeAdded: () => void;
}

export const AddNodeDialog: React.FC<AddNodeDialogProps> = ({
    open,
    onClose,
    groupId,
    hiddenNodes,
    selectedHiddenNode,
    onSelectedHiddenNodeChange,
    onRefresh,
    onMakeVisible,
    onNodeAdded
}) => {
    const [mode, setMode] = useState<'add' | 'show'>('add');
    const [isTitleValid, setIsTitleValid] = useState(false);

    useEffect(() => {
        if (open) {
            onRefresh();
        }
    }, [open, onRefresh]);

    const handleClose = () => {
        onClose();
    };

    const handleOK = () => {
        if (mode === 'show' && selectedHiddenNode) {
            onMakeVisible(selectedHiddenNode);
        }
        onClose();
    };

    const isOKButtonDisabled = () => {
        if (mode === 'show') {
            return !selectedHiddenNode;
        }
        return !isTitleValid;
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Add a Node
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
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
                <RadioGroup
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'add' | 'show')}
                    row
                    sx={{ mb: 2 }}
                >
                    <FormControlLabel 
                        value="add" 
                        control={<Radio />} 
                        label="Add New Node" 
                    />
                    <FormControlLabel 
                        value="show" 
                        control={<Radio />} 
                        label="Show Hidden Nodes" 
                    />
                </RadioGroup>

                <Box sx={{ display: mode === 'add' ? 'block' : 'none' }}>
                    <NewNodeForm
                        groupId={groupId}
                        onNodeAdded={onNodeAdded}
                        onTitleChange={setIsTitleValid}
                    />
                </Box>

                <Box sx={{ display: mode === 'show' ? 'block' : 'none' }}>
                    <NodesShowHidePanel
                        hiddenNodes={hiddenNodes}
                        selectedHiddenNode={selectedHiddenNode}
                        onSelectedHiddenNodeChange={onSelectedHiddenNodeChange}
                        onRefresh={onRefresh}
                        onMakeVisible={onMakeVisible}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleOK}
                    variant="contained"
                    disabled={isOKButtonDisabled()}
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 