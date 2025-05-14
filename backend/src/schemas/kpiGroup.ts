import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiGroup extends Document {
    title: string;
    archived?: boolean;
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
    }
});

export default mongoose.model<IKpiGroup>('KpiGroup', kpiGroupSchema); 