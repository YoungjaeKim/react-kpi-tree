// seed.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const kpiElement = require('../schmas/kpiElement');

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/dev';


// Connect to MongoDB
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


const deleteAllData = async () => {
    try {
        await kpiElement.deleteMany({});
        console.log('Data successfully deleted');
    } catch (error) {
        console.error('Error deleting data', error);
        throw error;
    }
}

const readFakeData = async (filePath) => {
    const jsonData = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    return JSON.parse(jsonData);
}

/**
 * Seeds the database with data from the provided filenames.
 * @param {string[]} filenames - An array of filenames containing the data to seed.
 */
const seedDatabase = async (filenames) => {
    try {
        for (let i = 0; i < filenames.length; i++) {
            const data = await readFakeData(filenames[i]);
            await kpiElement.insertMany(data);
            console.log(`\'${filenames[i]}\' is successfully seeded`);
        }
    } catch (error) {
        console.error('Error seeding data', error);
        throw error;
    }
};

// Run the functions in sequence
const runSeedProcess = async (filenames) => {
    try {
        await deleteAllData();
        await seedDatabase(filenames);
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
runSeedProcess([
    'seed_kpiElement.json'
]);