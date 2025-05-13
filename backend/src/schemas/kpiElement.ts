import mongoose, {Document, Schema} from 'mongoose';

export interface IKpiElement extends Document {
    kpiValue: string;
    kpiValueType: string;
    isActive: boolean;
    expression?: string;
    lastUpdatedDateTime: Date;
}

const kpiElementSchema = new Schema<IKpiElement>({
    kpiValue: {
        type: String,
        required: true,
        default: ""
    },
    kpiValueType: {
        type: String,
        required: true,
        default: "Integer"
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    },
    expression: {
        type: String
    },
    lastUpdatedDateTime: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IKpiElement>('KpiElement', kpiElementSchema);