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
    Typography,
    Divider
} from '@mui/material';
import { BlockNode, BlockNodeTransferForCreate } from '../types';
import { ExpressionInput } from './ExpressionInput';

interface NewNodeFormProps {
    groupId: string;
    onNodeAdded: (node: BlockNode) => void;
    onTitleChange?: (isValid: boolean) => void;
    onFormDataChange?: (data: BlockNodeTransferForCreate | null) => void;
    nodes?: BlockNode[]; // Add nodes prop for expression autocomplete
}

export const NewNodeForm: React.FC<NewNodeFormProps> = ({ 
    groupId, 
    onNodeAdded, 
    onTitleChange,
    onFormDataChange,
    nodes = []
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
        expression,
        setExpression,
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
            elementExpression: expression || "",
            elementId: ""
        };
        onFormDataChange?.(formData);
    };

    // Update form data when any field changes
    React.useEffect(() => {
        updateFormData();
    }, [title, label, elementValue, elementValueType, expression]);

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
            
            <Divider />
            
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Expression (Optional)
            </Typography>
            <ExpressionInput
                value={expression}
                onChange={(value) => {
                    setExpression(value);
                    updateFormData();
                }}
                nodes={nodes}
                label="Expression"
                placeholder="Type @ to see available nodes, then enter expression (e.g., @{elementId} + 10)"
                helperText="Use @ to reference other nodes. Supports +, -, *, /, %, (, )"
            />
        </Box>
    );
}; 