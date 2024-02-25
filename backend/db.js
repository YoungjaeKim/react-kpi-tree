require('dotenv').config();

const mongoose = require('mongoose');

const connect = () => {
    let mongoURI = process.env.MONGODB_DEV || 'mongodb://localhost:27017/dev';
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    } else {
        mongoose.set('debug', false);
        mongoURI = process.env.MONGODB_PROD;
    }
    mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => {
            console.log('MongoDB connection success', mongoURI)
        })
        .catch((error) => {
            console.log('MongoDB connection error', error);
        });

};

mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error', error);
});

mongoose.connection.on('disconnected', () => {
    console.error('MongoDB connection ended and trying reconnect.');
    connect();
});

module.exports = {
    connect
};
