import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiElementRecordString extends Document {
    elementId: mongoose.Types.ObjectId;
    recordValue: string;
    timestamp: Date;
}

const kpiElementRecordStringSchema = new Schema<IKpiElementRecordString>({
    elementId: {
        type: Schema.Types.ObjectId,
        ref: 'KpiElement',
        required: true
    },
    recordValue: {
        type: String,
        required: true,
        default: ""
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IKpiElementRecordString>('KpiElementRecordString', kpiElementRecordStringSchema); 