const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

/**
 * a visual tree structure data to represent each node(leaf). Data is defined in kpiElement.js
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
    groupId: {
        type: String,
        required: true,
        default: uuidv4
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
