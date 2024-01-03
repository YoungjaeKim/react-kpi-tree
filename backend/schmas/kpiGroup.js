const mongoose = require('mongoose');

/**
 * the highest level schema that represents a group of nodes and edges.
 */
const kpiGroupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    }
});

const KpiGroup = mongoose.model('KpiGroup', kpiGroupSchema);

module.exports = KpiGroup;

