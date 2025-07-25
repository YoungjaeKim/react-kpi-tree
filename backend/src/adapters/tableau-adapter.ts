import axios from 'axios';
import * as jsonpath from 'jsonpath-plus';
import { ExternalConnectionConfig, ExternalConnectionResponse } from '../types/external-connection';
import { ExternalConnectionAdapter } from './external-connection-adapter';

export class TableauAdapter implements ExternalConnectionAdapter {
    private authToken: string = '';
    private siteId: string = '';
    private config!: ExternalConnectionConfig;

    /**
     * Fetch data from Tableau
     * 
     * @param config example: name:eq:value (see; https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api_concepts_filtering_and_sorting.htm#filter_expressions)
     * @returns The response from the external connection
     */
    async fetch(config: ExternalConnectionConfig): Promise<ExternalConnectionResponse> {
        try {
            this.config = config;

            // Sign in to get auth token
            await this.signIn(config);

            // Get view data summary
            const viewId = config.parameters.view_id;
            const filter = config.parameters.filter || '';
            
            const csvData = await this.getViewData(viewId, filter);
            console.log(csvData);

            // Parse CSV data
            const { headers, rows } = this.parseCSV(csvData);

            // Extract a single value from the CSV data
            const targetColumn = config.parameters.target_column || headers[headers.length - 1]; // Default to last column (usually percentage)
            const targetRow = config.parameters.target_row || 0; // Default to first data row

            const columnIndex = headers.findIndex(header => 
                header.toLowerCase().includes(targetColumn.toLowerCase())
            );

            if (columnIndex === -1) {
                throw new Error(`Column containing "${targetColumn}" not found`);
            }

            if (targetRow >= rows.length) {
                throw new Error(`Row index ${targetRow} not found. Available rows: ${rows.length}`);
            }

            const value = rows[targetRow][columnIndex];

            return {
                success: true,
                value: value
            };
        } catch (error) {
            return {
                success: false,
                value: null,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

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

    private async getViewData(viewId: string, filters: string): Promise<any> {
        // https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api_ref_site.htm#query_views_for_site
        const url = `${this.baseUrl}/api/3.19/sites/${this.siteId}/views/${viewId}/data?filter=${filters}`;

        const response = await axios.get(url, {
            headers: { 
                'X-Tableau-Auth': this.authToken,
                'Accept': 'text/csv',
                'Content-Type': 'application/json'
            },
        });

        return response.data;
    }

    private get baseUrl(): string {
        return this.config.url.replace(/\/$/, '');
    }

    private parseCSV(csvData: string): { headers: string[], rows: string[][] } {
        const lines = csvData.trim().split('\n');
        const headers = this.parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => this.parseCSVLine(line));
        return { headers, rows };
    }

    private parseCSVLine(line: string): string[] {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
} 