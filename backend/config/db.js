// backend/config/db.js
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`); // Log successful connection and host
  } catch (error) {
    // If connection fails, log the error and exit the process
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with a non-zero code to indicate an error
  }
};

module.exports = connectDB; // Export the connectDB function for use in server.js
