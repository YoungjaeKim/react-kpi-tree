const mongoose = require('mongoose');

/**
 * a tree structure data to represent each node and its relationship.
 */
const kpiNodeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KpiNode'
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KpiNode',
        default: null
    },
    isRoot: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const KpiNode = mongoose.model('KpiNode', kpiNodeSchema);

module.exports = KpiNode;
