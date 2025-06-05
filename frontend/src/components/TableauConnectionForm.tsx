import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Paper,
    Typography,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface TableauView {
    id: string;
    name: string;
}

interface ParameterPair {
    key: string;
    value: string;
}

interface TableauConnectionFormProps {
    elementId: string;
    initialValues?: {
        name: string;
        url: string;
        tokenName: string;
        tokenValue: string;
        siteContentUrl: string;
        selectedViewId: string;
        pollingPeriodSeconds: string;
        parameters: ParameterPair[];
        type: string;
    };
    onConnectionChange: (connectionData: any) => void;
}

export const TableauConnectionForm: React.FC<TableauConnectionFormProps> = ({
    elementId,
    initialValues,
    onConnectionChange
}) => {
    const [connectionName, setConnectionName] = useState(initialValues?.name || '');
    const [url, setUrl] = useState(initialValues?.url || '');
    const [tokenName, setTokenName] = useState(initialValues?.tokenName || '');
    const [tokenValue, setTokenValue] = useState(initialValues?.tokenValue || '');
    const [siteContentUrl, setSiteContentUrl] = useState(initialValues?.siteContentUrl || '');
    const [selectedViewId, setSelectedViewId] = useState(initialValues?.selectedViewId || '');
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
    const [views, setViews] = useState<TableauView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update form values when initialValues change
    useEffect(() => {
        if (initialValues) {
            setConnectionName(initialValues.name || '');
            setUrl(initialValues.url || '');
            setTokenName(initialValues.tokenName || '');
            setTokenValue(initialValues.tokenValue || '');
            setSiteContentUrl(initialValues.siteContentUrl || '');
            setPollingPeriodSeconds(initialValues.pollingPeriodSeconds?.toString() || '20');
            setParameters(
                Object.entries(initialValues.parameters || {}).map(([key, value]) => ({
                    key,
                    value: String(value)
                }))
            );
            
            // Auto-fetch views if we have the required credentials and a selectedViewId
            if (initialValues.url && initialValues.tokenName && initialValues.tokenValue && initialValues.selectedViewId) {
                setSelectedViewId(initialValues.selectedViewId);
                // Auto-fetch views to populate the dropdown
                fetchViewsWithCredentials(
                    initialValues.url,
                    initialValues.tokenName,
                    initialValues.tokenValue,
                    initialValues.siteContentUrl || ''
                );
            } else {
                setSelectedViewId(initialValues.selectedViewId || '');
            }
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

    const fetchViewsWithCredentials = async (urlParam: string, tokenNameParam: string, tokenValueParam: string, siteContentUrlParam: string) => {
        setLoading(true);
        setError(null);
        try {
            // Step 1: Authenticate and get token through our backend
            const authResponse = await axios.post(`${process.env.REACT_APP_API_URL}/connections/tableau/auth`, {
                url: urlParam,
                tokenName: tokenNameParam,
                tokenValue: tokenValueParam,
                siteContentUrl: siteContentUrlParam
            });

            const { site, token } = authResponse.data.credentials;

            // Step 2: Fetch views using the token through our backend
            const viewsResponse = await axios.post(`${process.env.REACT_APP_API_URL}/connections/tableau/views`, {
                url: urlParam,
                siteId: site.id,
                token
            });

            // Transform the views data to match our interface
            const transformedViews = viewsResponse.data.views.view.map((view: any) => ({
                id: view.id,
                name: view.name
            }));

            setViews(transformedViews);
        } catch (err) {
            setError('Failed to fetch views');
            console.error('Error fetching views:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchViews = async () => {
        await fetchViewsWithCredentials(url, tokenName, tokenValue, siteContentUrl);
    };

    // Update parent component whenever form values change
    useEffect(() => {
        const connectionData = {
            elementId,
            name: connectionName,
            type: initialValues?.type || 'Tableau',
            parameters: parameters.reduce((acc, { key, value }) => {
                if (key) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>),
            url,
            tokenName,
            tokenValue,
            siteContentUrl,
            selectedViewId,
            pollingPeriodSeconds: Number(pollingPeriodSeconds),
            enable: true
        };

        onConnectionChange(() => {
            if (!connectionName || !url || !tokenName || !tokenValue || !selectedViewId) {
                return null;
            }
            return connectionData;
        });
    }, [
        connectionName,
        url,
        tokenName,
        tokenValue,
        siteContentUrl,
        selectedViewId,
        pollingPeriodSeconds,
        parameters,
        initialValues?.type
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
                required
                fullWidth
                error={!url}
                helperText={!url ? "URL is required" : ""}
            />
            <TextField
                label="Token Name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
                fullWidth
                error={!tokenName}
                helperText={!tokenName ? "Token name is required" : ""}
            />
            <TextField
                label="Token Value"
                value={tokenValue}
                onChange={(e) => setTokenValue(e.target.value)}
                required
                fullWidth
                error={!tokenValue}
                helperText={!tokenValue ? "Token value is required" : ""}
            />
            <TextField
                label="Site Content URL"
                value={siteContentUrl}
                onChange={(e) => setSiteContentUrl(e.target.value)}
                fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl fullWidth>
                    <InputLabel>View</InputLabel>
                    <Select
                        value={selectedViewId}
                        label="View"
                        onChange={(e) => setSelectedViewId(e.target.value)}
                        error={!selectedViewId}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            {views.length > 0 ? `${views.length} views available` : 'No views available'}
                        </MenuItem>
                        {views.map((view) => (
                            <MenuItem key={view.id} value={view.id}>
                                {view.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    onClick={fetchViews}
                    disabled={loading || !url || !tokenName || !tokenValue}
                    sx={{ 
                        minWidth: '120px',
                        height: '56px' // Match Material-UI's default input height
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Get Views'}
                </Button>
            </Box>

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
                    <Typography variant="subtitle1">Filters</Typography>
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

            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
}; 