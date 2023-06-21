const mongoose = require('mongoose');

/**
 * a tree structure data to represent each node and its relationship.
 */
const kpiEdgeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    }
});

const KpiEdge = mongoose.model('KpiEdge', kpiNodeSchema);

module.exports = KpiEdge;
