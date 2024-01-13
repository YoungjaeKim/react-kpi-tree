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
        await kpiGroup.deleteMany({});
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
        await kpiGroup.insertMany(jsonData["kpiGroup"]);

        // 2. insert kpiElement data
        await kpiElement.insertMany(jsonData["kpiElement"]);

        // 3. insert kpiNode data
        await kpiNode.insertMany(jsonData["kpiNode"]);

        // 4. insert kpiEdge data
        await kpiEdge.insertMany(jsonData["kpiEdge"]);

        console.log(`'${filename}' insertion success`);
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
