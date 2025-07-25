import axios from 'axios';
import { ExternalConnectionConfig, ExternalConnectionResponse, ExternalConnectionValidationResponse } from '../types/external-connection';
import { ExternalConnectionAdapter } from './external-connection-adapter';

export class OpenSearchAdapter implements ExternalConnectionAdapter {
    async validate(config: ExternalConnectionConfig): Promise<ExternalConnectionValidationResponse> {
        const errors: string[] = [];

        // Validate required fields
        if (!config.url) {
            errors.push('URL is required');
        } else {
            try {
                new URL(config.url);
            } catch {
                errors.push('URL must be a valid URL');
            }
        }

        // Validate authentication (required for OpenSearch)
        if (!config.username) {
            errors.push('Username is required for OpenSearch');
        }
        if (!config.authToken) {
            errors.push('Auth token is required for OpenSearch');
        }

        // Validate parameters (should be a valid search query object)
        if (!config.parameters || typeof config.parameters !== 'object') {
            errors.push('Parameters object is required for OpenSearch queries');
        } else {
            // Basic validation for OpenSearch query structure
            if (!config.parameters.query && !config.parameters.aggs) {
                errors.push('Parameters must contain either "query" or "aggs" for OpenSearch');
            }
        }

        // Validate polling period
        if (config.pollingPeriodSeconds <= 0) {
            errors.push('Polling period must be greater than 0');
        }

        if (errors.length > 0) {
            return {
                success: false,
                message: 'Validation failed',
                errors
            };
        }

        return {
            success: true,
            message: 'Configuration is valid'
        };
    }

    async fetch(config: ExternalConnectionConfig): Promise<ExternalConnectionResponse> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Add basic auth if credentials are provided
            if (config.username && config.authToken) {
                const auth = Buffer.from(`${config.username}:${config.authToken}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
            }

            const response = await axios.post(config.url, config.parameters, { headers });
            
            // Extract the first hit's score as the value
            // You might want to customize this based on your needs
            const value = response.data?.hits?.hits?.[0]?._score || 0;

            return {
                success: true,
                value
            };
        } catch (error) {
            return {
                success: false,
                value: null,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
} 