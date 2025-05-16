import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiGroup extends Document {
    title: string;
    archived?: boolean;
    nodeCount?: number;
    edgeCount?: number;
    timestamp?: Date;
}

const kpiGroupSchema = new Schema<IKpiGroup>({
    title: {
        type: String,
        required: true
    },
    archived: {
        type: Boolean,
        default: false,
        required: false
    },
    nodeCount: {
        type: Number,
        default: 0,
        required: false
    },
    edgeCount: {
        type: Number,
        default: 0,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: false
    }
});

export default mongoose.model<IKpiGroup>('KpiGroup', kpiGroupSchema); 