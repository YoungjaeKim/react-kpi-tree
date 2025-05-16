import React from 'react';
import { useNodeForm } from '../hooks/useNodeForm';
import { addNode } from '../services/nodeService';
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    FormHelperText,
    Typography
} from '@mui/material';

interface NodeFormProps {
    groupId: string;
    onNodeAdded: () => void;
    onTitleChange?: (isValid: boolean) => void;
}

export const NodeForm: React.FC<NodeFormProps> = ({ groupId, onNodeAdded, onTitleChange }) => {
    const {
        title,
        setTitle,
        label,
        setLabel,
        elementValueType,
        elementValue,
        setElementValue,
        elementValueError,
        handleElementValueTypeChange,
        validateElementValue,
        resetForm
    } = useNodeForm();

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        onTitleChange?.(newTitle.trim().length > 0);
    };

    const handleSubmit = async () => {
        if (!validateElementValue(elementValue, elementValueType)) {
            return;
        }

        const newNode = {
            position: { x: 100, y: 100 },
            groupId: groupId,
            title: title,
            label: label || title,
            elementValue: elementValue.trim(),
            elementValueType: elementValueType,
            elementIsActive: true,
            elementExpression: "",
            elementId: ""
        };

        try {
            await addNode(newNode);
            resetForm();
            onNodeAdded();
        } catch (error) {
            console.error('Failed to add node:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography component="span" sx={{ color: 'error.main', mr: 0.5 }}>* Required</Typography>
                <TextField
                    label="Title"
                    value={title}
                    onChange={handleTitleChange}
                    fullWidth
                    required
                />
            </Box>
            <TextField
                label="Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                fullWidth
            />
            <FormControl fullWidth>
                <InputLabel>Element Value Type</InputLabel>
                <Select
                    value={elementValueType}
                    onChange={(e) => handleElementValueTypeChange(e.target.value)}
                    label="Element Value Type"
                >
                    <MenuItem value="Integer">Integer</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                    <MenuItem value="String">String</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth error={!!elementValueError}>
                <TextField
                    label="Element Value"
                    value={elementValue}
                    onChange={(e) => {
                        if (validateElementValue(e.target.value, elementValueType)) {
                            setElementValue(e.target.value);
                        }
                    }}
                    error={!!elementValueError}
                />
                {elementValueError && (
                    <FormHelperText>{elementValueError}</FormHelperText>
                )}
            </FormControl>
        </Box>
    );
}; 