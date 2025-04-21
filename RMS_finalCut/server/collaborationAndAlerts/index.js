const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const morgan=require('morgan')
const logger=require('./utils/logger.js')
dotenv.config();

logger.error('this is a test error');


const collaborationRoutes = require('./routes/collaborationRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
 
 
const connectToDatabase = () => {
    try {
 
        mongoose.connect(process.env.MONGODB_URL)
        console.log("Connnected to MongoDB");
 
    }
    catch (error) {
        console.log(error)
    }
}
const app = express();
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(cors());
app.use(express.json());
 
// Routes
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/notifications', notificationRoutes);
 
 
// Start the server
const PORT = process.env.PORT || 5000;
 
 
async function startServer(){
    try{
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    }catch(err)
    {
        console.error('Error starting the server')
    }
 
}
startServer();