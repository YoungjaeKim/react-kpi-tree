import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import KpiElement from '../src/schemas/kpiElement';
import KpiNode from '../src/schemas/kpiNode';
import KpiEdge from '../src/schemas/kpiEdge';
import KpiGroup from '../src/schemas/kpiGroup';

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev';

interface SeedData {
    kpiGroup: any[];
    kpiElement: any[];
    kpiNode: any[];
    kpiEdge: any[];
}

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const deleteAllData = async (): Promise<void> => {
    try {
        // check kpiGroup item is empty or not
        const kpiGroupCount = await KpiGroup.countDocuments();
        await KpiGroup.deleteMany({});
        await KpiEdge.deleteMany({});
        await KpiNode.deleteMany({});
        await KpiElement.deleteMany({});
        console.log('Data successfully deleted');
    } catch (error) {
        console.error('Error deleting data', error);
        throw error;
    }
};

/**
 * Seeds the database with data from the provided filenames.
 */
const seedDatabase = async (filename: string): Promise<void> => {
    try {
        const fileData = fs.readFileSync(path.join(__dirname, filename), 'utf8');
        const jsonData: SeedData = JSON.parse(fileData);

        await KpiGroup.insertMany(jsonData.kpiGroup);
        await KpiElement.insertMany(jsonData.kpiElement);
        await KpiNode.insertMany(jsonData.kpiNode);
        await KpiEdge.insertMany(jsonData.kpiEdge);

        console.log(`'${filename}' insertion success`);
    } catch (error) {
        console.error('Error seeding data', error);
        throw error;
    }
};

// Run the functions in sequence
const runSeedProcess = async (filename: string): Promise<void> => {
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