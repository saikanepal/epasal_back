require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoute = require('./Routes/User-Routes')
const storeRoute = require('./Routes/Store-Routes');
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        console.log('MongoDB connected successfully');
        // Start the server only when MongoDB connection is successful
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

//routes here
app.use('/api/users', userRoute);
app.use('/api/store', storeRoute);

