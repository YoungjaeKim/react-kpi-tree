export interface ExternalConnectionConfig {
    name: string;
    elementId: string;
    type: string;
    parameters: Record<string, any>;
    url: string;
    username: string;
    authToken: string;
    pollingPeriodSeconds: number;
    enable: boolean;
}

export interface ExternalConnectionsConfig {
    connections: ExternalConnectionConfig[];
}

export interface ExternalConnectionResponse {
    success: boolean;
    value: any;
    error?: string;
}

export interface ExternalConnectionValidationResponse {
    success: boolean;
    message: string;
    errors?: string[];
} 