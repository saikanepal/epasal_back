require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // Import Morgan
const userRoute = require('./Routes/User-Routes');
const storeRoute = require('./Routes/Store-Routes');
const productRoute=require('./Routes/Product-Routes');
const reviewRoute=require("./Routes/Review-Route");
const orderRoute=require("./Routes/Order-Route");
const paymentRoute = require("./Routes/Payment-Route");
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('combined')); // Use Morgan for logging

// MongoDB connection
console.log(process.env.DB_URL)
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

// Routes here
app.use('/api/users', userRoute);
app.use('/api/store', storeRoute);
app.use('/api/product',productRoute);
app.use('/api/review/',reviewRoute);
app.use('/api/order/',orderRoute);
app.use('/api/payment/',paymentRoute);


