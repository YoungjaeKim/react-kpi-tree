require('dotenv').config();
const express = require("express");
const cors = require('cors');
const mongodb = require("./db"); // reference db.js to connect to MongoDB
const elementRoute = require("./routes/element");
const elementRecordRoute = require("./routes/element-records");
const graphRoute = require("./routes/graph");

const app = express();
// Enable CORS for all routes and origins
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send({ currentTime: new Date().toISOString() });
});

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

mongodb.connect();

app.listen(process.env.PORT, () => {
    console.log("server started. port " + process.env.PORT);
});

app.use('/elements', elementRoute);
app.use('/element-records', elementRecordRoute);
app.use('/graphs', graphRoute);

app.get('/elements', (req, res) => {
    res.status(200).json({ elements: [] });
});

app.post('/elements', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    // Simulate saving the resource and returning it
    const newElement = { title, description };
    res.status(201).json(newElement);
});

module.exports = app;
