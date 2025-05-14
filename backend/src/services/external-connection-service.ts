import fs from 'fs';
import path from 'path';
import { ExternalConnectionConfig, ExternalConnectionsConfig } from '../types/external-connection';
import { ExternalConnectionAdapter } from '../adapters/external-connection-adapter';
import { OpenSearchAdapter } from '../adapters/opensearch-adapter';
import { JsonAdapter } from '../adapters/json-adapter';

export class ExternalConnectionService {
    private connections: Map<string, NodeJS.Timeout> = new Map();
    private adapters: Map<string, ExternalConnectionAdapter> = new Map();

    constructor() {
        // Register adapters
        this.adapters.set('OpenSearch', new OpenSearchAdapter());
        this.adapters.set('Json', new JsonAdapter());
    }

    public async start(): Promise<void> {
        const config = this.loadConfig();
        
        for (const connection of config.connections) {
            await this.startConnection(connection);
        }
    }

    public stop(): void {
        for (const [name, interval] of this.connections.entries()) {
            clearInterval(interval);
            this.connections.delete(name);
        }
    }

    private loadConfig(): ExternalConnectionsConfig {
        const configPath = path.join(__dirname, '../config/external-connections.json');
        const configContent = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configContent);
    }

    private async startConnection(config: ExternalConnectionConfig): Promise<void> {
        // Skip if connection is disabled
        if (!config.enable) {
            console.log(`Connection '${config.name}' is disabled, skipping...`);
            return;
        }

        const adapter = this.adapters.get(config.type);
        if (!adapter) {
            console.error(`No adapter found for type: ${config.type}`);
            return;
        }

        // Initial fetch
        await this.fetchAndUpdate(config, adapter);

        // Set up interval
        const interval = setInterval(async () => {
            await this.fetchAndUpdate(config, adapter);
        }, config.pollingPeriodSeconds * 1000);

        this.connections.set(config.name, interval);
    }

    private async fetchAndUpdate(
        config: ExternalConnectionConfig,
        adapter: ExternalConnectionAdapter
    ): Promise<void> {
        try {
            const response = await adapter.fetch(config);
            if (response.success) {
                // Update the element value in your database
                // This is where you'd call your existing element update logic
                console.log(`Updated value for ${config.name}: ${response.value}`);
            } else {
                console.error(`Error fetching ${config.name}: ${response.error}`);
            }
        } catch (error) {
            console.error(`Unexpected error for ${config.name}:`, error);
        }
    }
} 