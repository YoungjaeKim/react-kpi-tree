import { ExternalConnectionConfig, ExternalConnectionResponse } from '../types/external-connection';

export interface ExternalConnectionAdapter {
    fetch(config: ExternalConnectionConfig): Promise<ExternalConnectionResponse>;
} 