const mongoose = require('mongoose');

/**
 * a tree structure data to represent each node and its relationship.
 *
 * @type {module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, {parent: {ref: string, default: null, type: ObjectId}, isRoot: {default: boolean, type: BooleanConstructor}, children: [{ref: string, type: ObjectId}], name: {type: StringConstructor, required: boolean}}, HydratedDocument<FlatRecord<{parent: {ref: string, default: null, type: ObjectId}, isRoot: {default: boolean, type: BooleanConstructor}, children: [{ref: string, type: ObjectId}], name: {type: StringConstructor, required: boolean}}>, {}>>}
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
    }
});

const KpiNode = mongoose.model('KpiNode', kpiNodeSchema);

module.exports = KpiNode;
