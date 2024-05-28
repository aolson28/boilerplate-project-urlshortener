const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const connectMongoDB = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log('Successfully connected to MongoDB')
        }, (err) => {
            console.error(err)
        }
    );
}

module.exports.connectMongoDB = connectMongoDB;