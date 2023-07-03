const mongoose = require('mongoose');

/**
 * a tree structure data to represent each edge relationship.
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
    },
    groupId: {
        type: String,
        required: true,
        index: true
    }
});

const KpiEdge = mongoose.model('KpiEdge', kpiEdgeSchema);

module.exports = KpiEdge;
