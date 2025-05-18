import React from 'react';
import { useNewNodeForm } from '../hooks/useNewNodeForm';
import { addNode } from '../services/blockGraphService';
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

interface NewNodeFormProps {
    groupId: string;
    onNodeAdded: () => void;
    onTitleChange?: (isValid: boolean) => void;
}

export const NewNodeForm: React.FC<NewNodeFormProps> = ({ groupId, onNodeAdded, onTitleChange }) => {
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
    } = useNewNodeForm();

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
            label: label || '',
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
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
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
                <FormControl sx={{ flex: 2 }} error={!!elementValueError}>
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
        </Box>
    );
}; 