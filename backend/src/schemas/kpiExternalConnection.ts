import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiExternalConnection extends Document {
    name: string;
    elementId: string;
    type: string;
    parameters: Record<string, any>;
    url: string;
    username?: string;
    authToken?: string;
    pollingPeriodSeconds: number;
    enable: boolean;
}

const kpiExternalConnectionSchema: Schema = new Schema({
    name: { type: String, required: true },
    elementId: { type: String, required: true },
    type: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed, required: true },
    url: { type: String, required: true },
    username: { type: String },
    authToken: { type: String },
    pollingPeriodSeconds: { type: Number, required: true },
    enable: { type: Boolean, required: true },
});

export default mongoose.model<IKpiExternalConnection>('KpiExternalConnection', kpiExternalConnectionSchema);