import { ExternalConnectionConfig, ExternalConnectionsConfig } from '../types/external-connection';
import { ExternalConnectionAdapter } from '../adapters/external-connection-adapter';
import { OpenSearchAdapter } from '../adapters/opensearch-adapter';
import { JsonAdapter } from '../adapters/json-adapter';

export class ExternalConnectionService {
    private connections: Map<string, NodeJS.Timeout> = new Map();
    private adapters: Map<string, ExternalConnectionAdapter> = new Map();
    private config?: ExternalConnectionsConfig;

    constructor(config?: ExternalConnectionsConfig) {
        this.config = config;
        
        // Register adapters
        this.adapters.set('OpenSearch', new OpenSearchAdapter());
        this.adapters.set('Json', new JsonAdapter());
    }

    public async start(): Promise<void> {
        try {
            if (!this.config) {
                console.log('No external connections configuration provided. Service will not start.');
                return;
            }

            console.log(`Starting external connection service with ${this.config.connections.length} connection(s)`);
            
            for (const connection of this.config.connections) {
                await this.startConnection(connection);
            }
        } catch (error) {
            console.error('Failed to start external connection service:', error);
            // Don't throw - let the app continue without external connections
        }
    }

    public stop(): void {
        if (this.connections.size === 0) {
            return;
        }

        console.log(`Stopping ${this.connections.size} external connection(s)`);
        for (const [name, interval] of this.connections.entries()) {
            clearInterval(interval);
            this.connections.delete(name);
        }
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