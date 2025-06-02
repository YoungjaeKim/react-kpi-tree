import axios from 'axios';
import * as jsonpath from 'jsonpath-plus';
import { ExternalConnectionConfig, ExternalConnectionResponse } from '../types/external-connection';
import { ExternalConnectionAdapter } from './external-connection-adapter';

export class JsonAdapter implements ExternalConnectionAdapter {
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