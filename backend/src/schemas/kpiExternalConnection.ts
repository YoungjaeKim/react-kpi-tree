import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiExternalConnection extends Document {
    name: string;
    elementId: mongoose.Types.ObjectId;
    type: string;
    parameters: Record<string, any>;
    url: string;
    pollingPeriodSeconds: number;
    enable: boolean;
}

const kpiExternalConnectionSchema: Schema = new Schema<IKpiExternalConnection>({
    name: { type: String, required: true },
    elementId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed, required: true },
    url: { type: String, required: true },
    pollingPeriodSeconds: { type: Number, required: true },
    enable: { type: Boolean, required: true },
}, { strict: false });

export default mongoose.model<IKpiExternalConnection>('KpiExternalConnection', kpiExternalConnectionSchema);