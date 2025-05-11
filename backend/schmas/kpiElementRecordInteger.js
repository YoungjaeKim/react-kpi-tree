const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * Record schema for Integer type KPI Element values
 */
const kpiElementRecordIntegerSchema = new Schema({
    elementId: { // parent reference
        type: Schema.Types.ObjectId,
        ref: 'KpiElement',
        required: true
    },
    recordValue: {
        type: Number,
        required: true,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const KpiElementRecordInteger = mongoose.model('KpiElementRecordInteger', kpiElementRecordIntegerSchema);

module.exports = KpiElementRecordInteger; 