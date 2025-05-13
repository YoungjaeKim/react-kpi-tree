import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiGroup extends Document {
    title: string;
}

const kpiGroupSchema = new Schema<IKpiGroup>({
    title: {
        type: String,
        required: true
    }
});

export default mongoose.model<IKpiGroup>('KpiGroup', kpiGroupSchema); 