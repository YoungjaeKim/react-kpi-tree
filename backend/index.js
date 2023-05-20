const mongoose = require('mongoose');

const connect = () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }

    mongoose.connect('mongodb://root:1234@127.0.0.1:27017/', {
        dbName: 'dev',
    })
        .then(() => {
            console.log('MongoDB connection success', '127.0.0.1:27017')
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
