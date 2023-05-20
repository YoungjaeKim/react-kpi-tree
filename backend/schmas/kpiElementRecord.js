const mongoose = require('mongoose');
const {Schema} = mongoose;

/*

 */
const kpiElementRecordSchema = new Schema({
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
        default: Date.now()
    },
})

const KpiElementRecord = mongoose.model('KpiElementRecord', kpiElementRecordSchema);

module.exports = KpiElementRecord;
