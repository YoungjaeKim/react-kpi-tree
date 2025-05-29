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
    CircularProgress,
    IconButton,
    Paper
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Adapter {
    name: string;
}

interface ExternalConnectionSettingsProps {
    elementId: string;
    connectionStatus: boolean | null;
    onConnectionChange: (connectionData: any) => void;
}

interface ParameterPair {
    key: string;
    value: string;
}

export const ExternalConnectionSettings: React.FC<ExternalConnectionSettingsProps> = ({
    elementId,
    connectionStatus,
    onConnectionChange
}) => {
    const [enabled, setEnabled] = useState<boolean>(connectionStatus !== null);
    const [adapters, setAdapters] = useState<Adapter[]>([]);
    const [selectedAdapter, setSelectedAdapter] = useState<string>('');
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adapterName, setAdapterName] = useState('');
    const [adapterConfig, setAdapterConfig] = useState('');
    const [isAdaptersLoaded, setIsAdaptersLoaded] = useState(false);
    const [parameters, setParameters] = useState<ParameterPair[]>([]);

    // First, fetch adapters
    useEffect(() => {
        const fetchAdapters = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/connections/spec`);
                setAdapters(response.data);
                setIsAdaptersLoaded(true);
            } catch (err) {
                setError('Failed to load adapter specifications');
            }
        };
        fetchAdapters();
    }, []);

    // Then, fetch connection details after adapters are loaded
    useEffect(() => {
        const fetchConnectionDetails = async () => {
            if (!isAdaptersLoaded || connectionStatus === null) return;

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/connections?elementId=${elementId}`);
                if (response.data && response.data.length > 0) {
                    const connection = response.data[0];
                    // Set adapter name and type
                    setAdapterName(connection.name || '');
                    setSelectedAdapter(connection.type || '');
                    
                    // Set all field values including parameters and other fields
                    setFieldValues({
                        ...connection.parameters,  // Include any custom parameters
                        url: connection.url || '',
                        username: connection.username || '',
                        authToken: connection.authToken || '',
                        pollingPeriodSeconds: connection.pollingPeriodSeconds?.toString() || ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch connection details:', error);
            }
        };
        fetchConnectionDetails();
    }, [isAdaptersLoaded, connectionStatus, elementId]);

    // Update parameters when fieldValues changes
    useEffect(() => {
        const paramPairs = Object.entries(fieldValues)
            .filter(([key]) => !['url', 'username', 'authToken', 'pollingPeriodSeconds'].includes(key))
            .map(([key, value]) => ({ key, value: String(value) }));
        setParameters(paramPairs);
    }, [fieldValues]);

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
            // Clear the fields when disabling
            setSelectedAdapter('');
            setFieldValues({});
            onConnectionChange(null);
        }
    };

    const handleParameterChange = (index: number, field: 'key' | 'value', value: string) => {
        setParameters(prevParameters => {
            const newParameters = [...prevParameters];
            newParameters[index] = { ...newParameters[index], [field]: value };
            return newParameters;
        });

        // Update fieldValues with the new parameters
        setFieldValues(prevFieldValues => {
            const newFieldValues = { ...prevFieldValues };
            if (field === 'key') {
                // Remove the old key if it exists
                const oldKey = parameters[index].key;
                if (oldKey) {
                    delete newFieldValues[oldKey];
                }
            }
            // Add the new key-value pair
            if (field === 'key' && value) {
                newFieldValues[value] = parameters[index].value;
            } else if (field === 'value' && parameters[index].key) {
                newFieldValues[parameters[index].key] = value;
            }
            return newFieldValues;
        });
    };

    const addParameter = () => {
        setParameters([...parameters, { key: '', value: '' }]);
    };

    const removeParameter = (index: number) => {
        const newParameters = parameters.filter((_, i) => i !== index);
        setParameters(newParameters);

        // Update fieldValues by removing the deleted parameter
        const newFieldValues = { ...fieldValues };
        delete newFieldValues[parameters[index].key];
        setFieldValues(newFieldValues);
    };

    // Add a function to get current connection data
    const getConnectionData = () => {
        if (!enabled || !selectedAdapter) {
            return null;
        }
        return {
            elementId,
            type: selectedAdapter,
            ...fieldValues
        };
    };

    // Expose getConnectionData to parent
    useEffect(() => {
        onConnectionChange(getConnectionData);
    }, []);

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

                            {/* Parameters Section */}
                            <Paper sx={{ p: 2, mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1">Parameters</Typography>
                                    <IconButton onClick={addParameter} size="small" color="primary">
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                                {parameters.map((param, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                        <Box sx={{ flex: 5 }}>
                                            <TextField
                                                label="Key"
                                                value={param.key}
                                                onChange={(e) => handleParameterChange(index, 'key', e.target.value)}
                                                fullWidth
                                                size="small"
                                            />
                                        </Box>
                                        <Box sx={{ flex: 5 }}>
                                            <TextField
                                                label="Value"
                                                value={param.value}
                                                onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                                                fullWidth
                                                size="small"
                                            />
                                        </Box>
                                        <Box sx={{ flex: 2, display: 'flex', alignItems: 'center' }}>
                                            <IconButton 
                                                onClick={() => removeParameter(index)}
                                                size="small"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Paper>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}; 