import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

export default CreateGroupDialog; 