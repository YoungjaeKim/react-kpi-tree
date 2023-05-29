const KpiElement = require("../schmas/kpiElement");
const KpiElementRecord = require("../schmas/kpiElementRecord");

exports.createElement = async (req, res) => {
    try {
        const newKpiElement = new KpiElement(req.body);
        const savedKpiElement = await newKpiElement.save();
        res.status(201).json(savedKpiElement);
    } catch (error) {
        console.error('Failed to save document:', error);
        res.status(500).send('Failed to save document');
    }
};

exports.getElements = async (req, res) => {
    const pageSize = 50; // Number of records to fetch per page
    const pageToken = parseInt(req.query.page, 10); // Token for the requested page

    // Check if pageToken is not a valid number
    const startIndex = (isNaN(pageToken) || pageToken < 0) ? 0 : pageToken;

    try {
        // Retrieve the resources with pagination
        const kpiElements = await KpiElement.find().skip(startIndex).limit(pageSize).exec();

        // Determine the next page token
        const nextPageToken = startIndex + pageSize;

        res.json({
            elements: kpiElements,
            nextPageToken: nextPageToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
};

exports.getElementById = (req, res) => {
    const resourceId = parseInt(req.params.id); // Convert the ID to a number

    // Find the resource with the matching ID
    const resource = KpiElement.find(r => r.id === resourceId);

    if (!resource) {
        // Return a 404 response if the resource is not found
        res.status(404).json({error: "Resource not found"});
    } else {
        // Return the resource as the response
        res.json(resource);
    }
};

exports.getElementRecords = (req, res) => {
    // Create a new instance of the Document model with the data
    const newKpiElementRecord = new KpiElementRecord(req.body);

    // Save the new document to the database
    newKpiElementRecord.save()
        .then((savedKpiElementRecord) => {
            console.log('Document saved:', savedKpiElementRecord);
            res.status(201).json(savedKpiElementRecord);
        })
        .catch((err) => {
            console.error('Failed to save document:', err);
            res.status(500).send('Failed to save document');
        });
};
