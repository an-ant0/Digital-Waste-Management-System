// backend/server.js
const express = require('express'); // Import Express
const dotenv = require('dotenv').config(); // Load environment variables from .env file
const connectDB = require('./config/db'); // Import the database connection function
const userRoutes = require('./routes/userRoutes'); // Import user routes
const locationRoutes = require('./routes/locationRoutes'); // ✅ Add this line
const { errorHandler } = require('./middleware/errorMiddleware'); // Import custom error handling middleware

// Connect to MongoDB database
connectDB();

const app = express(); // Initialize Express app

// Middleware to parse JSON bodies from incoming requests
app.use(express.json({ limit: '50mb' })); // For base64 image data
app.use(express.urlencoded({ extended: false }));

// API routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/location', locationRoutes); // ✅ Location sharing routes

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
