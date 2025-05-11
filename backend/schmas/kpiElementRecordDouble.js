const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * Record schema for Double type KPI Element values
 */
const kpiElementRecordDoubleSchema = new Schema({
    elementId: { // parent reference
        type: Schema.Types.ObjectId,
        ref: 'KpiElement',
        required: true
    },
    "recordValue": {
        "type": Number,
        "required": true,
        "default": 0.0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const KpiElementRecordDouble = mongoose.model('KpiElementRecordDouble', kpiElementRecordDoubleSchema);

module.exports = KpiElementRecordDouble; 