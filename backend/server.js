// backend/server.js
const express = require('express'); // Import Express
const dotenv = require('dotenv').config(); // Load environment variables from .env file
const connectDB = require('./config/db'); // Import the database connection function
const userRoutes = require('./routes/userRoutes'); // Import user routes
const { errorHandler } = require('./middleware/errorMiddleware'); // Import custom error handling middleware

// Connect to MongoDB database
connectDB();

const app = express(); // Initialize Express app

// Middleware to parse JSON bodies from incoming requests
app.use(express.json({ limit: '50mb' })); // Increase limit for potential base64 image data
// Middleware to parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: false }));

// Define API routes
// Any request to /api/users will be handled by userRoutes
app.use('/api/users', userRoutes);

// Use custom error handling middleware (should be placed after routes)
app.use(errorHandler);

// Set the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming requests
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
