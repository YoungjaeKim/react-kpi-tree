import React, { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Autocomplete,
    Box,
    Typography,
    Chip,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
    const inputRef = useRef<HTMLInputElement>(null);

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

    // Check if cursor is inside {@...} region
    const checkCursorInAtRegion = (text: string, cursorPos: number) => {
        // Find all {@...} regions
        const atRegions: Array<{start: number, end: number, searchTerm: string}> = [];
        const regex = /@\{([^}]*)\}/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            atRegions.push({
                start: match.index,
                end: match.index + match[0].length,
                searchTerm: match[1]
            });
        }
        
        // Check for incomplete @{...} regions (without closing brace)
        const incompleteRegex = /@\{([^}]*?)$/g;
        let incompleteMatch;
        while ((incompleteMatch = incompleteRegex.exec(text)) !== null) {
            atRegions.push({
                start: incompleteMatch.index,
                end: text.length,
                searchTerm: incompleteMatch[1]
            });
        }
        
        // Check if cursor is within any @{...} region
        for (const region of atRegions) {
            if (cursorPos >= region.start + 2 && cursorPos <= region.end) { // +2 to skip @{
                return {
                    isInside: true,
                    searchTerm: region.searchTerm,
                    regionStart: region.start
                };
            }
        }
        
        return { isInside: false, searchTerm: '', regionStart: -1 };
    };

    // Handle cursor position changes
    const handleCursorPositionChange = (newCursorPos: number) => {
        setCursorPosition(newCursorPos);
        
        const regionInfo = checkCursorInAtRegion(inputValue, newCursorPos);
        
        if (regionInfo.isInside) {
            setSearchTerm(regionInfo.searchTerm);
            setShowAutocomplete(true);
        } else {
            setShowAutocomplete(false);
            setSearchTerm('');
        }
    };

    // Handle text input changes
    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
        onChange(newValue);
        
        // Get current cursor position
        const currentCursorPos = inputRef.current?.selectionStart || 0;
        handleCursorPositionChange(currentCursorPos);
    };

    // Handle cursor position changes on selection/click
    const handleSelectionChange = () => {
        if (inputRef.current) {
            const newCursorPos = inputRef.current.selectionStart || 0;
            handleCursorPositionChange(newCursorPos);
        }
    };

    // Handle autocomplete selection
    const handleAutocompleteSelect = (option: ElementOption) => {
        const regionInfo = checkCursorInAtRegion(inputValue, cursorPosition);
        
        if (regionInfo.isInside) {
            const beforeRegion = inputValue.substring(0, regionInfo.regionStart);
            const afterRegion = inputValue.substring(cursorPosition);
            
            // Find the end of the current @{...} region
            const closingBraceIndex = afterRegion.indexOf('}');
            const actualAfterRegion = closingBraceIndex !== -1 
                ? afterRegion.substring(closingBraceIndex + 1) 
                : afterRegion;
            
            const newValue = beforeRegion + `@{${option.elementId}}` + actualAfterRegion;
            setInputValue(newValue);
            onChange(newValue);
        }
        
        setShowAutocomplete(false);
        setSearchTerm('');
    };

    // Handle close button click
    const handleCloseAutocomplete = () => {
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
                inputRef={inputRef}
                label={label}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onSelect={handleSelectionChange}
                onClick={handleSelectionChange}
                onKeyUp={handleSelectionChange}
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
                    {/* Header with close button */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 8px',
                            borderBottom: '1px solid #eee',
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            Select Node
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleCloseAutocomplete}
                            sx={{ padding: '2px' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    
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