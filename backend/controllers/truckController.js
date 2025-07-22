const asyncHandler = require('express-async-handler');
const Truck = require('../models/Truck'); // Import the Truck model

// You'll need access to the Socket.IO instance for real-time updates.
// We'll pass it from server.js when defining routes.
let io;
const setIoInstance = (socketIoInstance) => {
  io = socketIoInstance;
};

// @desc    Register a new truck
// @route   POST /api/trucks/register
// @access  Private (Admin only in a real app)
const registerTruck = asyncHandler(async (req, res) => {
  const { truckId, driverName, latitude, longitude } = req.body;

  if (!truckId || !driverName || latitude == null || longitude == null) {
    res.status(400);
    throw new Error('Please enter all required fields: truckId, driverName, latitude, longitude.');
  }

  // Check if truck already exists
  const truckExists = await Truck.findOne({ truckId });
  if (truckExists) {
    res.status(400);
    throw new Error('Truck with this ID already exists.');
  }

  const truck = await Truck.create({
    truckId,
    driverName,
    currentLocation: { latitude, longitude },
    lastUpdated: Date.now(),
  });

  if (truck) {
    res.status(201).json({
      _id: truck._id,
      truckId: truck.truckId,
      driverName: truck.driverName,
      currentLocation: truck.currentLocation,
      message: 'Truck registered successfully!',
    });
  } else {
    res.status(400);
    throw new Error('Invalid truck data');
  }
});

// @desc    Update a truck's live location
// @route   PUT /api/trucks/:truckId/location
// @access  Private (e.g., Truck driver app, or Admin panel)
const updateTruckLocation = asyncHandler(async (req, res) => {
  const { truckId } = req.params;
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    res.status(400);
    throw new Error('Latitude and Longitude are required for location update.');
  }

  const truck = await Truck.findOne({ truckId });

  if (!truck) {
    res.status(404);
    throw new Error('Truck not found.');
  }

  truck.currentLocation.latitude = latitude;
  truck.currentLocation.longitude = longitude;
  truck.lastUpdated = Date.now(); // Update timestamp

  const updatedTruck = await truck.save();

  // Emit real-time update if Socket.IO is available
  if (io) {
    io.emit('truckLocationUpdate', {
      truckId: updatedTruck.truckId,
      latitude: updatedTruck.currentLocation.latitude,
      longitude: updatedTruck.currentLocation.longitude,
      lastUpdated: updatedTruck.lastUpdated,
    });
  }

  res.json({
    truckId: updatedTruck.truckId,
    currentLocation: updatedTruck.currentLocation,
    lastUpdated: updatedTruck.lastUpdated,
    message: 'Truck location updated successfully!',
  });
});

// @desc    Get a single truck's latest location
// @route   GET /api/trucks/:truckId/location
// @access  Public (for user app to get initial location)
const getTruckLocation = asyncHandler(async (req, res) => {
  const { truckId } = req.params;

  const truck = await Truck.findOne({ truckId }).select('truckId driverName currentLocation lastUpdated status');

  if (!truck) {
    res.status(404);
    throw new Error('Truck not found or no location data available.');
  }

  res.json(truck);
});

// @desc    Get all active truck locations (e.g., for a map showing multiple trucks)
// @route   GET /api/trucks/locations/all
// @access  Public
const getAllTruckLocations = asyncHandler(async (req, res) => {
  const trucks = await Truck.find({ status: 'active' }).select('truckId driverName currentLocation lastUpdated status');

  if (!trucks || trucks.length === 0) {
    res.status(404).json({ message: 'No active trucks found.' });
    return;
  }

  res.json(trucks);
});


module.exports = {
  setIoInstance,
  registerTruck,
  updateTruckLocation,
  getTruckLocation,
  getAllTruckLocations,
};