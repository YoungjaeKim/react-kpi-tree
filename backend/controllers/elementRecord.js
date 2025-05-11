const KpiElement = require("../schmas/kpiElement");
const KpiElementRecordInteger = require("../schmas/kpiElementRecordInteger");
const KpiElementRecordDouble = require("../schmas/kpiElementRecordDouble");
const KpiElementRecordString = require("../schmas/kpiElementRecordString");
const {isNullOrEmpty} = require("../utils");


/**
 * Get element record by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getElementRecordById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId)) {
        res.status(400).json({error: "invalid id"});
        return;
    }

    try {
        const record = await KpiElementRecordInteger.findById(resourceId).populate('elementId');
        if (!record) {
            res.status(404).json({error: "Integer record not found"});
            return;
        }
        res.json(record);
    } catch (err) {
        console.error('Failed to fetch integer record:', err);
        res.status(500).json({error: 'Server error'});
    }
};

// Integer Records
exports.createIntegerRecord = async (req, res) => {
    try {
        const newRecord = new KpiElementRecordInteger(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        console.error('Failed to save integer record:', err);
        res.status(500).json({error: 'Failed to save integer record'});
    }
};

exports.getIntegerRecords = async (req, res) => {
    const pageSize = 50;
    const pageToken = parseInt(req.query.page, 10);
    const startIndex = (isNaN(pageToken) || pageToken < 0) ? 0 : pageToken;

    try {
        const records = await KpiElementRecordInteger.find()
            .skip(startIndex)
            .limit(pageSize)
            .populate('elementId')
            .exec();

        const nextPageToken = startIndex + pageSize;

        res.json({
            records: records,
            nextPageToken: nextPageToken
        });
    } catch (err) {
        console.error('Failed to fetch integer records:', err);
        res.status(500).json({error: 'Server error'});
    }
};

exports.getIntegerRecordById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId)) {
        res.status(400).json({error: "invalid id"});
        return;
    }

    try {
        const record = await KpiElementRecordInteger.findById(resourceId).populate('elementId');
        if (!record) {
            res.status(404).json({error: "Integer record not found"});
            return;
        }
        res.json(record);
    } catch (err) {
        console.error('Failed to fetch integer record:', err);
        res.status(500).json({error: 'Server error'});
    }
};

// Double Records
exports.createDoubleRecord = async (req, res) => {
    try {
        const newRecord = new KpiElementRecordDouble(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        console.error('Failed to save double record:', err);
        res.status(500).json({error: 'Failed to save double record'});
    }
};

exports.getDoubleRecords = async (req, res) => {
    const pageSize = 50;
    const pageToken = parseInt(req.query.page, 10);
    const startIndex = (isNaN(pageToken) || pageToken < 0) ? 0 : pageToken;

    try {
        const records = await KpiElementRecordDouble.find()
            .skip(startIndex)
            .limit(pageSize)
            .populate('elementId')
            .exec();

        const nextPageToken = startIndex + pageSize;

        res.json({
            records: records,
            nextPageToken: nextPageToken
        });
    } catch (err) {
        console.error('Failed to fetch double records:', err);
        res.status(500).json({error: 'Server error'});
    }
};

exports.getDoubleRecordById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId)) {
        res.status(400).json({error: "invalid id"});
        return;
    }

    try {
        const record = await KpiElementRecordDouble.findById(resourceId).populate('elementId');
        if (!record) {
            res.status(404).json({error: "Double record not found"});
            return;
        }
        res.json(record);
    } catch (err) {
        console.error('Failed to fetch double record:', err);
        res.status(500).json({error: 'Server error'});
    }
};

// String Records
exports.createStringRecord = async (req, res) => {
    try {
        const newRecord = new KpiElementRecordString(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        console.error('Failed to save string record:', err);
        res.status(500).json({error: 'Failed to save string record'});
    }
};

exports.getStringRecords = async (req, res) => {
    const pageSize = 50;
    const pageToken = parseInt(req.query.page, 10);
    const startIndex = (isNaN(pageToken) || pageToken < 0) ? 0 : pageToken;

    try {
        const records = await KpiElementRecordString.find()
            .skip(startIndex)
            .limit(pageSize)
            .populate('elementId')
            .exec();

        const nextPageToken = startIndex + pageSize;

        res.json({
            records: records,
            nextPageToken: nextPageToken
        });
    } catch (err) {
        console.error('Failed to fetch string records:', err);
        res.status(500).json({error: 'Server error'});
    }
};

exports.getStringRecordById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId)) {
        res.status(400).json({error: "invalid id"});
        return;
    }

    try {
        const record = await KpiElementRecordString.findById(resourceId).populate('elementId');
        if (!record) {
            res.status(404).json({error: "String record not found"});
            return;
        }
        res.json(record);
    } catch (err) {
        console.error('Failed to fetch string record:', err);
        res.status(500).json({error: 'Server error'});
    }
};
