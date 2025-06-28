import React, { useState, useEffect } from 'react';
import {
    TextField,
    Autocomplete,
    Box,
    Typography,
    Chip
} from '@mui/material';
import { BlockNode } from '../types';

interface ExpressionInputProps {
    value: string;
    onChange: (value: string) => void;
    nodes: BlockNode[];
    label?: string;
    placeholder?: string;
    fullWidth?: boolean;
    error?: boolean;
    helperText?: string;
    currentNodeId?: string;
}

interface ElementOption {
    elementId: string;
    title: string;
    kpiValue: string;
    displayText: string;
}

export const ExpressionInput: React.FC<ExpressionInputProps> = ({
    value,
    onChange,
    nodes,
    label = "Expression",
    placeholder = "Enter expression (e.g., @{elementId} + 10)",
    fullWidth = true,
    error = false,
    helperText,
    currentNodeId
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Create element options for autocomplete, excluding current node
    const elementOptions: ElementOption[] = nodes
        .filter(node => node.data.elementId && node.data.title && node.id !== currentNodeId)
        .map(node => ({
            elementId: node.data.elementId,
            title: node.data.title,
            kpiValue: node.data.element?.kpiValue || '0',
            displayText: `${node.data.title} (${node.data.element?.kpiValue || '0'})`
        }));

    // Filter options based on search term
    const filteredOptions = elementOptions.filter(option =>
        option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.elementId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle text input changes
    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
        onChange(newValue);
        
        // Check if we should show autocomplete
        const lastAtSymbol = newValue.lastIndexOf('@');
        if (lastAtSymbol !== -1) {
            const afterAt = newValue.substring(lastAtSymbol + 1);
            // Show autocomplete immediately when @ is typed
            if (afterAt === '' || afterAt.includes('{')) {
                setSearchTerm('');
                setShowAutocomplete(true);
                setCursorPosition(lastAtSymbol);
            } else if (afterAt.includes('{') && !afterAt.includes('}')) {
                // If user is typing inside braces, use that as search term
                const searchText = afterAt.substring(afterAt.indexOf('{') + 1);
                setSearchTerm(searchText);
                setShowAutocomplete(true);
                setCursorPosition(lastAtSymbol);
            } else {
                setShowAutocomplete(false);
                setSearchTerm('');
            }
        } else {
            setShowAutocomplete(false);
            setSearchTerm('');
        }
    };

    // Handle autocomplete selection
    const handleAutocompleteSelect = (option: ElementOption) => {
        const beforeAt = inputValue.substring(0, cursorPosition);
        const afterCursor = inputValue.substring(cursorPosition);
        
        // Check if we're already inside braces
        if (afterCursor.includes('{')) {
            const afterBrace = afterCursor.substring(afterCursor.indexOf('{') + 1);
            const afterElementId = afterBrace.includes('}') ? afterBrace.substring(afterBrace.indexOf('}') + 1) : afterBrace;
            const newValue = beforeAt + `@{${option.elementId}}` + afterElementId;
            setInputValue(newValue);
            onChange(newValue);
        } else {
            // Insert @{elementId} after the @ symbol, removing any existing @
            const afterAt = afterCursor.substring(1); // Remove the @ symbol
            const newValue = beforeAt + `@{${option.elementId}}` + afterAt;
            setInputValue(newValue);
            onChange(newValue);
        }
        
        setShowAutocomplete(false);
        setSearchTerm('');
    };

    // Update input value when prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <Box sx={{ position: 'relative' }}>
            <TextField
                label={label}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                fullWidth={fullWidth}
                error={error}
                helperText={helperText}
                multiline
                rows={2}
                sx={{
                    '& .MuiInputBase-root': {
                        fontFamily: 'monospace'
                    }
                }}
            />
            
            {showAutocomplete && filteredOptions.length > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        maxHeight: '200px',
                        overflow: 'auto',
                        mb: 1
                    }}
                >
                    {filteredOptions.map((option) => (
                        <Box
                            key={option.elementId}
                            onClick={() => handleAutocompleteSelect(option)}
                            sx={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                },
                                borderBottom: '1px solid #eee'
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {option.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                @{option.elementId} = {option.kpiValue}
                            </Typography>
                            {searchTerm && (
                                <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}>
                                    Matches: "{searchTerm}"
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            )}
            
            {/* Expression preview */}
            {inputValue && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Expression: {inputValue}
                    </Typography>
                </Box>
            )}
            
            {/* Help text */}
            {!inputValue && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px dashed #dee2e6' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        💡 Tip: Type @ to see available nodes. You can search by node title or element ID.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}; 