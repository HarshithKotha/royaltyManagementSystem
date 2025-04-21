const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
 
dotenv.config();
 
const createAuthRouter = require('./routes/auth.js');
 
 
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
app.use(cors());
app.use(express.json());
 
// Routes
app.use('/api/auth', createAuthRouter);
 
 
 
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