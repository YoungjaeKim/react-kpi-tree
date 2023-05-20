const mongoose = require('mongoose');
const {Schema} = mongoose;

/**
 * an element definition.
 *
 * @type {module:mongoose.Schema<any, Model<any, any, any, any>, {}, {}, {}, {}, DefaultSchemaOptions, {displayRule: {require: boolean, type: StringConstructor}, expression: {type: StringConstructor}, prefix: {type: StringConstructor}, description: {require: boolean, type: StringConstructor}, lastUpdatedDateTime: {default: number, type: DateConstructor}, title: {require: boolean, type: StringConstructor}, suffix: {type: StringConstructor}}, HydratedDocument<FlatRecord<{displayRule: {require: boolean, type: StringConstructor}, expression: {type: StringConstructor}, prefix: {type: StringConstructor}, description: {require: boolean, type: StringConstructor}, lastUpdatedDateTime: {default: number, type: DateConstructor}, title: {require: boolean, type: StringConstructor}, suffix: {type: StringConstructor}}>, {}>>}
 */
const kpiElementSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: false
    },
    isShown: {
        type: Boolean,
        require: false,
        default: true
    },
    expression: { // a mathematic expression to reference other elements
        type: String
    },
    prefix: { // display prefix
        type: String
    },
    suffix: { // display suffix
        type: String
    },
    lastUpdatedDateTime: {
        type: Date,
        default: Date.now()
    },
});

const KpiElement = mongoose.model('KpiElement', kpiElementSchema); // create Model

module.exports = KpiElement;


