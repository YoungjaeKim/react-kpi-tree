import axios from 'axios';
import { ExternalConnectionConfig, ExternalConnectionsConfig } from '../types/external-connection';
import { ExternalConnectionAdapter } from '../adapters/external-connection-adapter';
import { OpenSearchAdapter } from '../adapters/opensearch-adapter';
import { JsonAdapter } from '../adapters/json-adapter';
import { TableauAdapter } from '../adapters/tableau-adapter';
import { ElementService } from './element-service';
import { WebSocketServer, WebSocket } from 'ws';

export class ExternalConnectionService {
    private connections: Map<string, NodeJS.Timeout> = new Map();
    private adapters: Map<string, ExternalConnectionAdapter> = new Map();
    private config?: ExternalConnectionsConfig;
    private elementService: ElementService;
    private wss?: WebSocketServer;
    private activeConnections: Set<WebSocket> = new Set();

    constructor(elementService: ElementService, config?: ExternalConnectionsConfig) {
        this.elementService = elementService;
        this.config = config;
        
        // Register adapters
        this.adapters.set('OpenSearch', new OpenSearchAdapter());
        this.adapters.set('Json', new JsonAdapter());
        this.adapters.set('Tableau', new TableauAdapter());
    }

    // Set WebSocket server instance
    public setWebSocketServer(wss: WebSocketServer): void {
        this.wss = wss;
        
        // Set up connection tracking
        wss.on('connection', (ws: WebSocket) => {
            console.log('New WebSocket client connected. Total clients:', this.activeConnections.size + 1);
            this.activeConnections.add(ws);

            ws.on('close', () => {
                console.log('WebSocket client disconnected. Remaining clients:', this.activeConnections.size - 1);
                this.activeConnections.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket client error:', error);
                this.activeConnections.delete(ws);
            });
        });
    }

    // Broadcast update to all connected clients
    private broadcastUpdate(elementId: string, value: string): void {
        if (!this.wss) {
            console.log('WebSocket server not initialized');
            return;
        }

        const message = JSON.stringify({
            type: 'kpi_update',
            elementId,
            value,
            timestamp: new Date().toISOString()
        });

        console.log(`Broadcasting to ${this.activeConnections.size} active clients`);
        this.activeConnections.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            } else {
                console.log('Skipping inactive client');
                this.activeConnections.delete(client);
            }
        });
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

    // Fetch connections from API by elementId
    public async getExternalConnections(elementId: string): Promise<ExternalConnectionConfig[]> {
        try {
            const apiUrl = process.env.EXTERNAL_CONNECTIONS_API_URL || 'http://localhost:5000/connections';
            const response = await axios.get(apiUrl, { params: { elementId } });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch external connections from API:', error);
            return [];
        }
    }

    // New start method for MongoDB-based config
    public async startForElement(elementId: string): Promise<void> {
        try {
            const connections = await this.getExternalConnections(elementId);
            if (!connections.length) {
                console.log('No external connections found for elementId:', elementId);
                return;
            }
            console.log(`Starting external connection service with ${connections.length} connection(s) for elementId ${elementId}`);
            for (const connection of connections) {
                await this.startConnection(connection);
            }
        } catch (error) {
            console.error('Failed to start external connection service:', error);
        }
    }

    // Fetch all enabled connections from API
    public async getAllEnabledConnections(): Promise<ExternalConnectionConfig[]> {
        try {
            const apiUrl = process.env.EXTERNAL_CONNECTIONS_API_URL || 'http://localhost:8080/connections';
            const response = await axios.get(apiUrl, { params: { enable: true } });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch enabled external connections from API:', error);
            return [];
        }
    }

    // Start polling for all enabled connections
    public async startAllEnabled(): Promise<void> {
        try {
            const connections = await this.getAllEnabledConnections();
            if (!connections.length) {
                console.log('No enabled external connections found.');
                return;
            }
            console.log(`Starting external connection service with ${connections.length} enabled connection(s)`);
            for (const connection of connections) {
                await this.startConnection(connection);
            }
        } catch (error) {
            console.error('Failed to start external connection service:', error);
        }
    }

    // Add a public method to start polling for a single connection
    public async startSingleConnection(config: ExternalConnectionConfig): Promise<void> {
        // Stop any existing connection with the same name before starting a new one
        this.stopSingleConnection(config.name);
        await this.startConnection(config);
    }

    // Add a public method to stop polling for a single connection by name
    public stopSingleConnection(name: string): void {
        if (this.connections.has(name)) {
            clearInterval(this.connections.get(name)!);
            this.connections.delete(name);
            console.log(`Stopped polling for connection: ${name}`);
        }
    }

    // Add a public method to get adapters for validation
    public getAdapters(): Map<string, ExternalConnectionAdapter> {
        return this.adapters;
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
        console.log(`Started polling for connection: ${config.name} with period: ${config.pollingPeriodSeconds} seconds`);
    }

    private async fetchAndUpdate(
        config: ExternalConnectionConfig,
        adapter: ExternalConnectionAdapter
    ): Promise<void> {
        try {
            const response = await adapter.fetch(config);
            if (response.success && response.value !== undefined && response.value !== null) {
                const updatedElement = await this.elementService.updateElement(config.elementId, { kpiValue: String(response.value) });
                if (updatedElement) {
                    console.log(`Successfully updated element ${config.elementId} for connection ${config.name} with value: ${response.value}`);
                    // Broadcast the update to all connected clients
                    this.broadcastUpdate(config.elementId, String(response.value));
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