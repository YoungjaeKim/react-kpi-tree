const mongoose = require('mongoose');
const {v4: uuidv4} = require("uuid");

/**
 * a visual tree structure data to represent each edge(linkage) relationship.
 */
const kpiEdgeSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    groupId: { // same data as kpiNode.groupId in order to group nodes and edges
        type: String,
        required: true,
        index: true,
        default: uuidv4
    }
});

const KpiEdge = mongoose.model('KpiEdge', kpiEdgeSchema);

module.exports = KpiEdge;
