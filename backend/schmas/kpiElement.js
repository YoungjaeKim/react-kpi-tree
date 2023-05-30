const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * an Element definition.
 */
const kpiElementSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: false
    },
    isShown: {
        type: Boolean,
        require: false,
        default: true
    },
    expression: { // a mathematics expression to reference other elements
        type: String
    },
    prefix: { // display prefix
        type: String
    },
    suffix: { // display suffix
        type: String
    },
    lastUpdatedDateTime: {
        type: Date,
        default: Date.now
    },
});

const KpiElement = mongoose.model('KpiElement', kpiElementSchema); // create Model

module.exports = KpiElement;


