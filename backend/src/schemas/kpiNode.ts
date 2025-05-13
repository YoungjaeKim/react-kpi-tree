import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiNode extends Document {
    position: {
        x: number;
        y: number;
    };
    groupId: mongoose.Types.ObjectId;
    title?: string;
    description?: string;
    label?: string;
    elementId: mongoose.Types.ObjectId;
    hidden: boolean;
}

const kpiNodeSchema = new Schema<IKpiNode>({
    position: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        }
    },
    groupId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    label: {
        type: String,
        required: false
    },
    elementId: {
        type: Schema.Types.ObjectId,
        ref: 'KpiElement',
        required: true
    },
    hidden: {
        type: Boolean,
        required: false,
        default: false
    }
});

export default mongoose.model<IKpiNode>('KpiNode', kpiNodeSchema); 