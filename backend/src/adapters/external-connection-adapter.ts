import { ExternalConnectionConfig, ExternalConnectionResponse, ExternalConnectionValidationResponse } from '../types/external-connection';

export interface ExternalConnectionAdapter {
    fetch(config: ExternalConnectionConfig): Promise<ExternalConnectionResponse>;
    validate(config: ExternalConnectionConfig): Promise<ExternalConnectionValidationResponse>;
} 