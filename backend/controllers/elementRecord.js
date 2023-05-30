const KpiElement = require("../schmas/kpiElement");
const KpiElementRecord = require("../schmas/kpiElementRecord");
const {isNullOrEmpty} = require("../utils");

// element-records
exports.createElementRecords = async (req, res) => {
    try {
        const newKpiElementRecord = new KpiElementRecord(req.body);
        const savedKpiElementRecord = await newKpiElementRecord.save();
        res.status(201).json(savedKpiElementRecord);
    } catch (err) {
        console.error('Failed to save document:', err);
        res.status(500).send('Failed to save document');
    }
};

exports.getElementRecords = async (req, res) => {
    const pageSize = 50; // Number of records to fetch per page
    const pageToken = parseInt(req.query.page, 10); // Token for the requested page

    // Check if pageToken is not a valid number
    const startIndex = (isNaN(pageToken) || pageToken < 0) ? 0 : pageToken;

    try {
        // Retrieve the resources with pagination
        const elementRecords = await KpiElementRecord.find().skip(startIndex).limit(pageSize).exec();

        // Determine the next page token
        const nextPageToken = startIndex + pageSize;

        res.json({
            elements: elementRecords,
            nextPageToken: nextPageToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
};


exports.getElementRecordById = async (req, res) => {
    const resourceId = req.params.id;
    if (isNullOrEmpty(resourceId))
        res.status(401).json({error: "invalid id"});

    // Find the resource with the matching ID
    const resource = await KpiElementRecord.findOne({id: resourceId});

    if (!resource) {
        // Return a 404 response if the resource is not found
        res.status(404).json({error: "Resource not found"});
    } else {
        // Return the resource as the response
        res.json(resource);
    }
};
