import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiElementRecordDouble extends Document {
    elementId: mongoose.Types.ObjectId;
    recordValue: number;
    timestamp: Date;
}

const kpiElementRecordDoubleSchema = new Schema<IKpiElementRecordDouble>({
    elementId: {
        type: Schema.Types.ObjectId,
        ref: 'KpiElement',
        required: true
    },
    recordValue: {
        type: Number,
        required: true,
        default: 0.0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IKpiElementRecordDouble>('KpiElementRecordDouble', kpiElementRecordDoubleSchema); 