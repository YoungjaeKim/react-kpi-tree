import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControlLabel,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import { TableauConnectionForm } from './TableauConnectionForm';
import { DefaultConnectionForm } from './DefaultConnectionForm';

interface Adapter {
    name: string;
}

interface ExternalConnectionSettingsProps {
    elementId: string;
    connectionStatus: boolean | null;
    onConnectionChange: (connectionData: any) => void;
    initialAdapter?: string;
}

export const ExternalConnectionSettings: React.FC<ExternalConnectionSettingsProps> = ({
    elementId,
    connectionStatus,
    onConnectionChange,
    initialAdapter
}) => {
    const [enabled, setEnabled] = useState<boolean>(connectionStatus === true);
    const [adapters, setAdapters] = useState<Adapter[]>([]);
    const [selectedAdapter, setSelectedAdapter] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdaptersLoaded, setIsAdaptersLoaded] = useState(false);
    const [hasExistingConnection, setHasExistingConnection] = useState<boolean | null>(connectionStatus);
    const [connectionData, setConnectionData] = useState<any>(null);

    // First, fetch adapters
    useEffect(() => {
        const fetchAdapters = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/connections/spec`);
                setAdapters(response.data);
                setIsAdaptersLoaded(true);
                
                // Set initial adapter only after adapters are loaded
                if (initialAdapter) {
                    const adapterExists = response.data.some((adapter: Adapter) => adapter.name === initialAdapter);
                    if (adapterExists) {
                        setSelectedAdapter(initialAdapter);
                    }
                }
            } catch (err) {
                setError('Failed to load adapter specifications');
            }
        };
        fetchAdapters();
    }, [initialAdapter]);

    // Then, fetch connection details after adapters are loaded
    useEffect(() => {
        const fetchConnectionDetails = async () => {
            if (!isAdaptersLoaded) return;

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/connections?elementId=${elementId}`);
                if (response.status === 200 && response.data && response.data.length > 0) {
                    const connection = response.data[0];
                    // Only set adapter if it exists in the loaded adapters
                    const adapterExists = adapters.some(adapter => adapter.name === connection.type);
                    if (adapterExists) {
                        setSelectedAdapter(connection.type || '');
                    }
                    setEnabled(connection.enable === true);
                    setHasExistingConnection(true);
                    setConnectionData(connection);
                } else {
                    setHasExistingConnection(null);
                    setEnabled(false);
                    // Don't reset selectedAdapter if it was set from initialAdapter
                    if (!initialAdapter) {
                        setSelectedAdapter('');
                    }
                    setConnectionData(null);
                }
            } catch (error) {
                console.error('Failed to fetch connection details:', error);
                setHasExistingConnection(null);
                setEnabled(false);
                // Don't reset selectedAdapter if it was set from initialAdapter
                if (!initialAdapter) {
                    setSelectedAdapter('');
                }
                setConnectionData(null);
            }
        };
        fetchConnectionDetails();
    }, [isAdaptersLoaded, elementId, adapters, initialAdapter]);

    const handleAdapterChange = (adapterName: string) => {
        setSelectedAdapter(adapterName);
        
        // If there's no existing connection or the connection name is empty,
        // set a default connection name with the format "{adapterName}-{yyyymmdd}"
        if (!connectionData || !connectionData.name) {
            const today = new Date();
            const yyyymmdd = today.getFullYear().toString() +
                (today.getMonth() + 1).toString().padStart(2, '0') +
                today.getDate().toString().padStart(2, '0');
            const defaultName = `${adapterName}-${yyyymmdd}`;
            
            const newConnectionData = {
                ...connectionData,
                name: defaultName,
                type: adapterName,
                enable: enabled
            };
            setConnectionData(newConnectionData);
            onConnectionChange(newConnectionData);
        } else {
            // Update existing connection data with new type
            const newConnectionData = {
                ...connectionData,
                type: adapterName
            };
            setConnectionData(newConnectionData);
            onConnectionChange(newConnectionData);
        }
    };

    const handleEnableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEnabled = event.target.checked;
        setEnabled(newEnabled);
        // Pass the current connection data with enabled state and type
        onConnectionChange({
            ...connectionData,
            enable: newEnabled,
            type: selectedAdapter
        });
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    const showConnectionForm = enabled || hasExistingConnection !== null || selectedAdapter !== '';

    const renderConnectionForm = () => {
        if (selectedAdapter === 'Tableau') {
            return (
                <TableauConnectionForm
                    elementId={elementId}
                    initialValues={connectionData}
                    onConnectionChange={onConnectionChange}
                />
            );
        }

        // Default form for Json and OpenSearch
        return (
            <DefaultConnectionForm
                elementId={elementId}
                initialValues={connectionData}
                onConnectionChange={onConnectionChange}
            />
        );
    };

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

            {showConnectionForm && (
                <>
                    <FormControl fullWidth>
                        <InputLabel>Available Connections</InputLabel>
                        <Select
                            value={selectedAdapter}
                            label="Available Connections"
                            onChange={(e) => handleAdapterChange(e.target.value)}
                            disabled={!!initialAdapter}
                        >
                            {adapters.map((adapter) => (
                                <MenuItem key={adapter.name} value={adapter.name}>
                                    {adapter.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedAdapter && renderConnectionForm()}
                </>
            )}
        </Box>
    );
}; 