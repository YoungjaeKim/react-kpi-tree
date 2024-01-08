const mongoose = require('mongoose');
const {v4: uuidv4} = require("uuid");
const {Schema} = require("mongoose");

/**
 * a visual tree structure data to represent each edge(linkage) relationship.
 */
const kpiEdgeSchema = new mongoose.Schema({
    source: {
        type: Schema.Types.ObjectId,
        required: true
    },
    target: {
        type: Schema.Types.ObjectId,
        required: true
    },
    groupId: { // same data as kpiNode.groupId in order to group nodes and edges
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    }
});

const KpiEdge = mongoose.model('KpiEdge', kpiEdgeSchema);

module.exports = KpiEdge;
