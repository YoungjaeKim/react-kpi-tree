const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const kpiElement = require('../schmas/kpiElement');
const kpiNode = require('../schmas/kpiNode');
const kpiEdge = require('../schmas/kpiEdge');
const kpiGroup = require('../schmas/kpiGroup');

const mongoURI = 'mongodb://localhost:27017/dev';


// Connect to MongoDB
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


const deleteAllData = async () => {
    try {
        await kpiEdge.deleteMany({});
        await kpiNode.deleteMany({});
        await kpiElement.deleteMany({});
        console.log('Data successfully deleted');
    } catch (error) {
        console.error('Error deleting data', error);
        throw error;
    }
}

/**
 * Seeds the database with data from the provided filenames.
 */
const seedDatabase = async (filename) => {
    try {
        const fileData = fs.readFileSync(path.join(__dirname, filename), 'utf8');
        const jsonData = JSON.parse(fileData);

        // 1. insert kpiGroup data
        const kpiGroupData = jsonData["kpiGroup"];
        await kpiGroup.insertMany(kpiGroupData);

        // 2. insert kpiElement data
        const insertedElements = await kpiElement.insertMany(jsonData["kpiElement"]);
        const elementIds = insertedElements.map(element => element._id);

        // 3. insert kpiNode data
        const kpiNodeData = jsonData["kpiNode"]
        // Replace the placeholder elementId with actual ObjectIds from inserted KpiElements
        kpiNodeData.forEach((node, index) => {
            node.data.elementId = elementIds[index % elementIds.length]; // Loop if fewer elements than nodes
        });
        await kpiNode.insertMany(kpiNodeData);

        // 3. insert kpiEdge data
        await kpiEdge.insertMany(jsonData["kpiEdge"]);
    } catch (error) {
        console.error('Error seeding data', error);
        throw error;
    }
};

// Run the functions in sequence
const runSeedProcess = async (filename) => {
    try {
        await deleteAllData();
        await seedDatabase(filename);
    } catch (error) {
        // Handle any errors that occurred during delete or seed
        console.error('An error occurred during the seed process', error);
    } finally {
        // Close the connection to the database
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

// Run the seed process. Delete all database and seed with the following files.
runSeedProcess('seed_v1.json');
