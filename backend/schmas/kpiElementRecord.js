const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * an ElementRecord which contains time-series data of an Element
 */
const kpiElementRecordSchema = new Schema({
    elementId: {
        type: Schema.Types.ObjectId,
        ref: 'KpiElement',
        required: true
    },
    recordKey: {
        type: String,
        require: true
    },
    recordValue: {
        type: Number,
        require: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const KpiElementRecord = mongoose.model('KpiElementRecord', kpiElementRecordSchema);

module.exports = KpiElementRecord;
