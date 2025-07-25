import axios from 'axios';
import * as jsonpath from 'jsonpath-plus';
import { ExternalConnectionConfig, ExternalConnectionResponse, ExternalConnectionValidationResponse } from '../types/external-connection';
import { ExternalConnectionAdapter } from './external-connection-adapter';

export class JsonAdapter implements ExternalConnectionAdapter {
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

        if (!config.parameters?.jsonPath) {
            errors.push('JSONPath is required in parameters');
        } else {
            try {
                // Basic JSONPath syntax validation
                const path = config.parameters.jsonPath as string;
                if (!path.startsWith('$')) {
                    errors.push('JSONPath must start with "$"');
                }
            } catch {
                errors.push('Invalid JSONPath syntax');
            }
        }

        // Validate authentication if provided
        if (config.username && !config.authToken) {
            errors.push('Auth token is required when username is provided');
        }
        if (!config.username && config.authToken) {
            errors.push('Username is required when auth token is provided');
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

            const response = await axios.get(config.url, { headers });
            
            // Extract value using JSONPath
            const jsonPath = config.parameters.jsonPath as string;
            const values = jsonpath.JSONPath({ path: jsonPath, json: response.data });
            
            // Return the first value found, or null if none found
            const value = values.length > 0 ? values[0] : "";

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