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

module.exports = app;
