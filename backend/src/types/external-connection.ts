export interface ExternalConnectionConfig {
    name: string;
    elementId: string;
    type: string;
    parameters: Record<string, any>;
    url: string;
    username: string;
    authToken: string;
    pollingPeriodSeconds: number;
}

export interface ExternalConnectionsConfig {
    connections: ExternalConnectionConfig[];
}

export interface ExternalConnectionResponse {
    success: boolean;
    value: any;
    error?: string;
} 