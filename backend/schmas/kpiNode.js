const mongoose = require('mongoose');

/**
 * a tree structure data to represent each node and its relationship.
 */
const kpiNodeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
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
    data: {
        label: {
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
