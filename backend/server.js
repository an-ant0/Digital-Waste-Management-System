// backend/server.js
const express = require('express'); // Import Express framework
const dotenv = require('dotenv').config(); // Load environment variables from .env file
const connectDB = require('./config/db'); // Import the database connection function
const userRoutes = require('./routes/userRoutes'); // Import user authentication and profile routes
const initializeTruckRoutes = require('./routes/truckRoutes'); // Import the initializer for truck routes (which needs `io`)
const customPickupRoutes = require('./routes/customPickupRoutes'); // Import custom pickup routes <--- ADDED THIS IMPORT
const { errorHandler } = require('./middleware/errorMiddleware'); // Import custom error handling middleware

// For Socket.IO real-time communication
const http = require('http'); // Node.js built-in HTTP module to create a server
const { Server } = require('socket.io'); // Socket.IO Server class
const cors = require('cors'); // CORS middleware for Express and Socket.IO to handle cross-origin requests

// Connect to MongoDB database
connectDB();

const app = express(); // Initialize Express application

// Create a standard HTTP server from the Express app.
// This server will be used by both Express for REST APIs and Socket.IO for WebSockets.
const server = http.createServer(app);

// Initialize Socket.IO server and attach it to the HTTP server.
// Configure CORS for Socket.IO to allow connections from your React Native app's development server.
const io = new Server(server, {
  cors: {
    // These origins are common for React Native development on different platforms/emulators.
    // Adjust these to your specific frontend development server URLs in production.
    origin: ['http://localhost:19000', 'http://10.0.2.2:19000', 'exp://10.0.2.2:19000', 'http://192.168.1.76:19000'], // Example: Add your local IP if testing on physical device
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods for Socket.IO handshake
  },
});

// CORS middleware for Express APIs.
// This allows your frontend (running on a different origin/port) to make HTTP requests to your backend.
app.use(cors({
  origin: '*', // For development, allowing all origins. In production, specify your frontend's exact domain.
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods for REST API requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers in requests
}));

// Middleware to parse incoming JSON request bodies.
// `limit: '50mb'` is set to handle potentially large payloads, e.g., base64 image strings.
app.use(express.json({ limit: '50mb' }));

// Middleware to parse incoming URL-encoded request bodies (e.g., from HTML forms).
app.use(express.urlencoded({ extended: false }));

// Define API routes.
// Requests to /api/users will be handled by userRoutes.
app.use('/api/users', userRoutes);

// Requests to /api/trucks will be handled by truckRoutes.
// The `initializeTruckRoutes` function is called here, passing the `io` instance
// so the truck controller can emit real-time updates.
app.use('/api/trucks', initializeTruckRoutes(io));

// Requests to /api/custompickups will be handled by customPickupRoutes.
app.use('/api/custompickups', customPickupRoutes); // <--- Route for custom pickup requests

// Socket.IO connection handler.
// This block defines what happens when a new client connects to the Socket.IO server.
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Event listener for when a client disconnects.
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Example: You can add other socket event listeners here if your frontend needs to send events to the backend.
  // For instance, if a client sends a 'requestTrucks' event:
  // socket.on('requestTrucks', async () => {
  //   // Example: Fetch active trucks from DB and send them back to the requesting client
  //   const trucks = await Truck.find({ status: 'active' }).select('truckId driverName currentLocation');
  //   socket.emit('initialTrucks', trucks); // Emit to this specific socket
  // });
});


// Custom error handling middleware.
// This should be placed after all your routes so it can catch errors from them.
app.use(errorHandler);

// Set the port for the server. It uses the PORT environment variable, or defaults to 5000.
const PORT = process.env.PORT || 5000;

// Start the HTTP server and listen for incoming requests on the specified port.
// This server handles both Express REST API requests and Socket.IO WebSocket connections.
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));