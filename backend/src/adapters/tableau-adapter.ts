import axios from 'axios';
import * as jsonpath from 'jsonpath-plus';
import { ExternalConnectionConfig, ExternalConnectionResponse } from '../types/external-connection';
import { ExternalConnectionAdapter } from './external-connection-adapter';

export class TableauAdapter implements ExternalConnectionAdapter {
    private authToken: string = '';
    private siteId: string = '';
    private config!: ExternalConnectionConfig;

    private async signIn(config: ExternalConnectionConfig): Promise<void> {
        const url = `${this.baseUrl}/api/3.19/auth/signin`;
        const headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const response = await axios.post(url, {
            credentials: {
                personalAccessTokenName: config.username,
                personalAccessTokenSecret: config.authToken,
                site: { contentUrl: config.parameters.site_content_url || "" },
            },
        }, { headers });

        const { token, site } = response.data.credentials;
        this.authToken = token;
        this.siteId = site.id;
    }

    private async getViewDataSummary(viewId: string, filters: Record<string, string>): Promise<any> {
        const params = new URLSearchParams();
        for (const key in filters) {
            params.append(`vf_${key}`, filters[key]);
        }

        const url = `${this.baseUrl}/api/3.19/sites/${this.siteId}/views/${viewId}/data/summaries?${params}`;

        const response = await axios.get(url, {
            headers: { 
                'X-Tableau-Auth': this.authToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        return response.data;
    }

    private get baseUrl(): string {
        return this.config.url.replace(/\/$/, '');
    }

    async fetch(config: ExternalConnectionConfig): Promise<ExternalConnectionResponse> {
        try {
            this.config = config;

            // Sign in to get auth token
            await this.signIn(config);

            // Get view data summary
            const viewId = config.parameters.view_id;
            const filters = config.parameters.filters ? JSON.parse(config.parameters.filters) : {};
            
            const summaryData = await this.getViewDataSummary(viewId, filters);
            console.log(summaryData);

            // Extract value using JSONPath if provided, otherwise use default extraction
            if (config.parameters.jsonPath) {
                const values = jsonpath.JSONPath({ path: config.parameters.jsonPath, json: summaryData });
                const value = values.length > 0 ? values[0] : null;
                return {
                    success: true,
                    value
                };
            } else {
                // Default extraction logic
                const { data: rows, columns } = summaryData;
                const targetColumn = config.parameters.target_column || 'percentage';
                const targetValue = config.parameters.target_value;

                const columnIndex = columns.findIndex((col: any) => 
                    col.fieldName === targetColumn || col.fieldName.includes(targetColumn)
                );

                if (columnIndex === -1) {
                    throw new Error(`Column ${targetColumn} not found`);
                }

                const value = targetValue 
                    ? rows.find((row: any) => parseFloat(row[columnIndex]) === parseFloat(targetValue))
                    : rows[0];

                return {
                    success: true,
                    value
                };
            }
        } catch (error) {
            return {
                success: false,
                value: null,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
} 