import fs from 'fs';
import path from 'path';
import { ExternalConnectionsConfig } from '../types/external-connection';

export class ConfigurationService {
    private static instance: ConfigurationService;
    private externalConnections?: ExternalConnectionsConfig;

    private constructor() {}

    public static getInstance(): ConfigurationService {
        if (!ConfigurationService.instance) {
            ConfigurationService.instance = new ConfigurationService();
        }
        return ConfigurationService.instance;
    }

    public async loadExternalConnectionsConfig(configPath: string): Promise<ExternalConnectionsConfig | undefined> {
        try {
            if (!fs.existsSync(configPath)) {
                console.log(`Config file not found at ${configPath}`);
                return undefined;
            }

            const configContent = fs.readFileSync(configPath, 'utf-8');
            this.externalConnections = JSON.parse(configContent);
            console.error(`External connections config loaded at ${configPath}`);
            return this.externalConnections;
        } catch (error) {
            console.error('Failed to load external connections config:', error);
            return undefined;
        }
    }

    public getExternalConnectionsConfig(): ExternalConnectionsConfig | undefined {
        return this.externalConnections;
    }
} 