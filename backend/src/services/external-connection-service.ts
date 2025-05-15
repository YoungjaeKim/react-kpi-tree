import { ExternalConnectionConfig, ExternalConnectionsConfig } from '../types/external-connection';
import { ExternalConnectionAdapter } from '../adapters/external-connection-adapter';
import { OpenSearchAdapter } from '../adapters/opensearch-adapter';
import { JsonAdapter } from '../adapters/json-adapter';
import { ElementService } from './element-service';

export class ExternalConnectionService {
    private connections: Map<string, NodeJS.Timeout> = new Map();
    private adapters: Map<string, ExternalConnectionAdapter> = new Map();
    private config?: ExternalConnectionsConfig;
    private elementService: ElementService;

    constructor(elementService: ElementService, config?: ExternalConnectionsConfig) {
        this.elementService = elementService;
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
            if (response.success && response.value !== undefined && response.value !== null) {
                const updatedElement = await this.elementService.recordAndUpdateKpiValue(config.elementId, String(response.value));
                if (updatedElement) {
                    console.log(`Successfully updated element ${config.elementId} for connection ${config.name} with value: ${response.value}`);
                } else {
                    console.error(`Failed to update element ${config.elementId} for connection ${config.name} via ElementService.`);
                }
            } else if (!response.success) {
                console.error(`Error fetching data for connection ${config.name}: ${response.error}`);
            } else {
                console.warn(`No value received from adapter for connection ${config.name}. Element ${config.elementId} not updated.`);
            }
        } catch (error) {
            console.error(`Unexpected error during fetchAndUpdate for connection ${config.name}:`, error);
        }
    }
} 