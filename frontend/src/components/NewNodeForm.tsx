import React from 'react';
import { useNewNodeForm } from '../hooks/useNewNodeForm';
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
import { BlockNode, BlockNodeTransferForCreate } from '../types';

interface NewNodeFormProps {
    groupId: string;
    onNodeAdded: (node: BlockNode) => void;
    onTitleChange?: (isValid: boolean) => void;
    onFormDataChange?: (data: BlockNodeTransferForCreate | null) => void;
}

export const NewNodeForm: React.FC<NewNodeFormProps> = ({ 
    groupId, 
    onNodeAdded, 
    onTitleChange,
    onFormDataChange 
}) => {
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
    } = useNewNodeForm();

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        onTitleChange?.(newTitle.trim().length > 0);
        updateFormData();
    };

    const updateFormData = () => {
        const formData: BlockNodeTransferForCreate = {
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
        onFormDataChange?.(formData);
    };

    // Update form data when any field changes
    React.useEffect(() => {
        updateFormData();
    }, [title, label, elementValue, elementValueType]);


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
                onChange={(e) => {
                    setLabel(e.target.value);
                    updateFormData();
                }}
                fullWidth
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Element Value Type</InputLabel>
                    <Select
                        value={elementValueType}
                        onChange={(e) => {
                            handleElementValueTypeChange(e.target.value);
                            updateFormData();
                        }}
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
                                updateFormData();
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