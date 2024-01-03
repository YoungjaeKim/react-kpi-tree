const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');
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
    groupId: { // same data as kpiEdge.groupId in order to group nodes and edges
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    data: {
        label: { // a latest visual label
            type: String,
            required: false
        },
        elementId: {
            type: Schema.Types.ObjectId,
            ref: 'KpiElement',
            required: true
        }
    }
});

const KpiNode = mongoose.model('KpiNode', kpiNodeSchema);

module.exports = KpiNode;
