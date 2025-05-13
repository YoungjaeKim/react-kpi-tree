import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export interface Request extends ExpressRequest {
    body: any;
    params: any;
    query: any;
}

export interface Response extends ExpressResponse {
    json: (body: any) => this;
    status: (code: number) => this;
    send: (body: any) => this;
} 