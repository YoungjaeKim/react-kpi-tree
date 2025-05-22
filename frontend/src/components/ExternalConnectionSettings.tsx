import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControlLabel,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

interface Adapter {
    name: string;
}

interface ExternalConnectionSettingsProps {
    elementId: string;
    onConnectionChange: (connectionData: any) => void;
}

export const ExternalConnectionSettings: React.FC<ExternalConnectionSettingsProps> = ({
    elementId,
    onConnectionChange
}) => {
    const [enabled, setEnabled] = useState(false);
    const [adapters, setAdapters] = useState<Adapter[]>([]);
    const [selectedAdapter, setSelectedAdapter] = useState<string>('');
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdapters = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/connections/spec`);
                setAdapters(response.data);
            } catch (err) {
                setError('Failed to load adapter specifications');
            }
        };
        fetchAdapters();
    }, []);

    const handleAdapterChange = (adapterName: string) => {
        setSelectedAdapter(adapterName);
        // Reset field values when adapter changes
        setFieldValues({});
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleEnableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEnabled = event.target.checked;
        setEnabled(newEnabled);
        if (!newEnabled) {
            // Reset values when disabled
            setSelectedAdapter('');
            setFieldValues({});
        }
    };

    // Notify parent component of changes
    useEffect(() => {
        if (enabled && selectedAdapter) {
            onConnectionChange({
                elementId,
                type: selectedAdapter,
                ...fieldValues
            });
        } else {
            onConnectionChange(null);
        }
    }, [enabled, selectedAdapter, fieldValues, elementId, onConnectionChange]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={enabled}
                        onChange={handleEnableChange}
                    />
                }
                label="Enable live update connection"
            />

            {enabled && (
                <>
                    <FormControl fullWidth>
                        <InputLabel>Available Connections</InputLabel>
                        <Select
                            value={selectedAdapter}
                            label="Available Connections"
                            onChange={(e) => handleAdapterChange(e.target.value)}
                        >
                            {adapters.map((adapter) => (
                                <MenuItem key={adapter.name} value={adapter.name}>
                                    {adapter.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedAdapter && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="URL"
                                value={fieldValues.url || ''}
                                onChange={(e) => handleFieldChange('url', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Username"
                                value={fieldValues.username || ''}
                                onChange={(e) => handleFieldChange('username', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Auth Token"
                                value={fieldValues.authToken || ''}
                                onChange={(e) => handleFieldChange('authToken', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Polling Period (seconds)"
                                type="number"
                                value={fieldValues.pollingPeriodSeconds || ''}
                                onChange={(e) => handleFieldChange('pollingPeriodSeconds', e.target.value)}
                                fullWidth
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}; 