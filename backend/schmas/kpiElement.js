const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * Data layer for kpiNode.js
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
    isActive:{
        type: Boolean,
        require: false,
        default: true
    },
    expression: { // a mathematics expression to reference other elements
        type: String
    },
    lastUpdatedDateTime: {
        type: Date,
        default: Date.now
    },
});

const KpiElement = mongoose.model('KpiElement', kpiElementSchema); // create Model

module.exports = KpiElement;


