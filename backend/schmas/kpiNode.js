const mongoose = require('mongoose');
const {Schema} = require("mongoose");

/**
 * a visual tree structure data to represent each node(dot or leaf).
 * Data layer is defined in kpiElement.js
 */
const kpiNodeSchema = new mongoose.Schema({
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
    groupId: { // same value as kpiEdge.groupId in order to group nodes and edges
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        require: false
    },
    label:{
        type: String,
        require: false
    },
    elementId: {
        type: Schema.Types.ObjectId,
        ref: 'KpiElement',
        required: true
    }
});

const KpiNode = mongoose.model('KpiNode', kpiNodeSchema);

module.exports = KpiNode;
