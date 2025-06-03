import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface ParameterPair {
    key: string;
    value: string;
}

interface DefaultConnectionFormProps {
    elementId: string;
    initialValues?: {
        name: string;
        url: string;
        username: string;
        authToken: string;
        pollingPeriodSeconds: string;
        parameters: ParameterPair[];
    };
    onConnectionChange: (connectionData: any) => void;
}

export const DefaultConnectionForm: React.FC<DefaultConnectionFormProps> = ({
    elementId,
    initialValues,
    onConnectionChange
}) => {
    const [connectionName, setConnectionName] = useState(initialValues?.name || '');
    const [url, setUrl] = useState(initialValues?.url || '');
    const [username, setUsername] = useState(initialValues?.username || '');
    const [authToken, setAuthToken] = useState(initialValues?.authToken || '');
    const [pollingPeriodSeconds, setPollingPeriodSeconds] = useState(
        initialValues?.pollingPeriodSeconds?.toString() || '20'
    );
    const [parameters, setParameters] = useState<ParameterPair[]>(
        initialValues?.parameters 
            ? Object.entries(initialValues.parameters).map(([key, value]) => ({
                key,
                value: String(value)
              }))
            : []
    );

    // Update form values when initialValues change
    useEffect(() => {
        if (initialValues) {
            setConnectionName(initialValues.name || '');
            setUrl(initialValues.url || '');
            setUsername(initialValues.username || '');
            setAuthToken(initialValues.authToken || '');
            setPollingPeriodSeconds(initialValues.pollingPeriodSeconds?.toString() || '20');
            setParameters(
                Object.entries(initialValues.parameters || {}).map(([key, value]) => ({
                    key,
                    value: String(value)
                }))
            );
        }
    }, [initialValues]);

    const handleParameterChange = (index: number, field: 'key' | 'value', value: string) => {
        setParameters(prevParameters => {
            const newParameters = [...prevParameters];
            newParameters[index] = { ...newParameters[index], [field]: value };
            return newParameters;
        });
    };

    const addParameter = () => {
        setParameters([...parameters, { key: '', value: '' }]);
    };

    const removeParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    // Update parent component whenever form values change
    useEffect(() => {
        const connectionData = {
            elementId,
            name: connectionName,
            parameters: parameters.reduce((acc, { key, value }) => {
                if (key) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>),
            url,
            username,
            authToken,
            pollingPeriodSeconds: Number(pollingPeriodSeconds),
            enable: true
        };

        onConnectionChange(() => {
            if (!connectionName) {
                return null;
            }
            return connectionData;
        });
    }, [
        connectionName,
        url,
        username,
        authToken,
        pollingPeriodSeconds,
        parameters
    ]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Connection Name"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                required
                fullWidth
                error={!connectionName}
                helperText={!connectionName ? "Connection name is required" : ""}
            />
            <TextField
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
            />
            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
            />
            <TextField
                label="Auth Token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                fullWidth
            />
            <TextField
                label="Polling Period (seconds)"
                type="number"
                value={pollingPeriodSeconds}
                onChange={(e) => setPollingPeriodSeconds(e.target.value)}
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
    );
}; 