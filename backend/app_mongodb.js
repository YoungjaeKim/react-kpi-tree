const express = require("express");
const mongodb = require("./index"); // reference index.js to connect to MongoDB
const mongoose = require("mongoose");
const KpiElement = require("./schmas/kpiElement");
const KpiElementRecord = require("./schmas/kpiElementRecord");

const app = express();
// Middleware to parse incoming request bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

mongodb.connect();

app.listen(3000, () => {
    console.log("server started. port 3000");
});

// Define a route for token-based pagination
app.get('/elements', async (req, res) => {
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Define a route to get a resource by ID
app.get('/elements/:id', (req, res) => {
    const resourceId = parseInt(req.params.id); // Convert the ID to a number

    // Find the resource with the matching ID
    const resource = KpiElement.find(r => r.id === resourceId);

    if (!resource) {
        // Return a 404 response if the resource is not found
        res.status(404).json({ error: "Resource not found" });
    } else {
        // Return the resource as the response
        res.json(resource);
    }
});

app.post("/elements", (req, res) => {
    // Create a new instance of the Document model with the data
    const newKpiElement = new KpiElement(req.body);

    // Save the new document to the database
    newKpiElement.save()
        .then((savedKpiElement) => {
            console.log('Document saved:', savedKpiElement);
            res.status(201).json(savedKpiElement);
        })
        .catch((err) => {
            console.error('Failed to save document:', err);
            res.status(500).send('Failed to save document');
        });
});

app.post("/element-records", (req, res) => {
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
});
