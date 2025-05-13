import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiEdge extends Document {
    source: mongoose.Types.ObjectId;
    target: mongoose.Types.ObjectId;
    groupId: mongoose.Types.ObjectId;
}

const kpiEdgeSchema = new Schema<IKpiEdge>({
    source: {
        type: Schema.Types.ObjectId,
        required: true
    },
    target: {
        type: Schema.Types.ObjectId,
        required: true
    },
    groupId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    }
});

export default mongoose.model<IKpiEdge>('KpiEdge', kpiEdgeSchema); 