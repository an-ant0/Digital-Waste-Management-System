require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Database connection
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const initializeTruckRoutes = require('./routes/truckRoutes');
const customPickupRoutes = require('./routes/customPickupRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const wasteReportRoutes = require('./routes/wasteReportRoutes');
const rewardRoutes = require('./routes/rewardRoutes');

// Middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for Express routes
const allowedOrigins = process.env.NODE_ENV === "production"
  ? ["https://myfrontend.com", "https://admin.myfrontend.com"]
  : "*";

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const truckRoutes = initializeTruckRoutes(io);

app.use('/api/users', userRoutes);
app.use('/api/custom-pickups', customPickupRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/waste', wasteReportRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/trucks', truckRoutes);

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Custom error handling middleware (must be after routes)
app.use(errorHandler);

// Server port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
