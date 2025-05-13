import axios from 'axios';
import { ExternalConnectionConfig, ExternalConnectionResponse } from '../types/external-connection';
import { ExternalConnectionAdapter } from './external-connection-adapter';

export class OpenSearchAdapter implements ExternalConnectionAdapter {
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