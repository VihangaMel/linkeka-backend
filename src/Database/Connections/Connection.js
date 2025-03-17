require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB URI
const dbURI =  process.env.MONGODB_CONN;
// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
// Event handling for successful connection
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected.');
});
// Event handling for connection error
mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error: ' + err);
});
// Event handling when the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});


module.exports= mongoose;