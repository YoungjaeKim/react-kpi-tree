const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * Record schema for String type KPI Element values
 */
const kpiElementRecordStringSchema = new Schema({
    elementId: { // parent reference
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

const KpiElementRecordString = mongoose.model('KpiElementRecordString', kpiElementRecordStringSchema);

module.exports = KpiElementRecordString; 