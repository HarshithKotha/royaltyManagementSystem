const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { generateRandomStreams } = require('./services/streamService');

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());


// Connect to MongoDB
mongoose.connect('mongodb+srv://harshithkotha007:19R21A05F2@harshithkotha.ebvcg.mongodb.net/royaltyManagementData', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// Schedule the cron job to run every minute
cron.schedule('* * * * *', () => {
    console.log('Running cron job to update streams...');
    generateRandomStreams();
});

// Start the server
const port = 6000; // Different port for this cron job server
app.listen(port, () => {
    console.log(`Stream update service is running on port ${port}`);
});
