const express = require("express");
const mongodb = require("./db"); // reference db.js to connect to MongoDB
const elementRoute = require("./routes/element");

const app = express();
// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

mongodb.connect();

app.listen(3000, () => {
    console.log("server started. port 3000");
});

app.use('/element', elementRoute);
