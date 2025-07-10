const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const kpiElement = require('../schemas/kpiElement');
const kpiNode = require('../schemas/kpiNode');
const kpiEdge = require('../schemas/kpiEdge');
const kpiGroup = require('../schemas/kpiGroup');

const mongoURI = process.env.MONGODB_DEV || 'mongodb://localhost:27017/dev';


// Connect to MongoDB
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


const deleteAllData = async () => {
    try {
        // check kpiGroup item is empty or not
        const kpiGroupCount = await kpiGroup.countDocuments();
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

        await kpiGroup.insertMany(jsonData["kpiGroup"]);
        await kpiElement.insertMany(jsonData["kpiElement"]);
        await kpiNode.insertMany(jsonData["kpiNode"]);
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
        console.error('An error occurred during the seed process', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

// Run the seed process. Delete all database and seed with the following files.
runSeedProcess('seed_v1.json');
