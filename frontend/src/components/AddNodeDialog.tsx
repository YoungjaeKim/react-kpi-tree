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
import { BlockNode, BlockNodeTransferForCreate } from '../types';
import { toBlockNode } from '../utils/nodeUtils';
import { addNode, updateNode } from '../services/blockGraphService';

interface AddNodeDialogProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    onNodeAdded: (node: BlockNode) => void;
    setNodes: React.Dispatch<React.SetStateAction<BlockNode[]>>;
    nodes?: BlockNode[]; // Add nodes prop for expression autocomplete
}

export const AddNodeDialog: React.FC<AddNodeDialogProps> = ({
    open,
    onClose,
    groupId,
    onNodeAdded,
    setNodes,
    nodes = []
}) => {
    const [mode, setMode] = useState<'add' | 'show'>('add');
    const [isTitleValid, setIsTitleValid] = useState(false);
    const [hiddenNodes, setHiddenNodes] = useState<BlockNode[]>([]);
    const [selectedHiddenNode, setSelectedHiddenNode] = useState<string>('');
    const [formData, setFormData] = useState<BlockNodeTransferForCreate | null>(null);

    const fetchHiddenNodes = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/graphs/node?groupId=${groupId}&hidden=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch hidden nodes');
            }
            const data = await response.json();
            setHiddenNodes(Array.isArray(data) ? data.map((node: any) => toBlockNode(node)) : []);
        } catch (error) {
            console.error('Error fetching hidden nodes:', error);
            setHiddenNodes([]); // Set empty array on error
        }
    };

    useEffect(() => {
        if (open) {
            setSelectedHiddenNode('');
            fetchHiddenNodes();
        }
    }, [open]);

    const handleClose = () => {
        onClose();
    };

    const handleOK = async () => {
        try {
            let responseNode: BlockNode;

            if (mode === 'show' && selectedHiddenNode) {
                // Show hidden node
                responseNode = await updateNode(selectedHiddenNode, { hidden: false }, setNodes);
            } else if (mode === 'add' && formData) {
                // Create new node with form data
                responseNode = await addNode(formData);
            } else {
                return;
            }

            // Update the nodes in the parent component
            setNodes(prevNodes => [...prevNodes, responseNode]);

            // Close the dialog
            onClose();
        } catch (error) {
            console.error('Error handling node operation:', error);
        }
    };

    const isOKButtonDisabled = () => {
        if (mode === 'show') {
            return !selectedHiddenNode;
        }
        return !isTitleValid || !formData;
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
                        onFormDataChange={setFormData}
                        nodes={nodes}
                    />
                </Box>

                <Box sx={{ display: mode === 'show' ? 'block' : 'none' }}>
                    <NodesShowHidePanel
                        hiddenNodes={hiddenNodes}
                        selectedHiddenNode={selectedHiddenNode}
                        onSelectedHiddenNodeChange={setSelectedHiddenNode}
                        onRefresh={fetchHiddenNodes}
                        onMakeVisible={() => {}} // This is no longer used
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