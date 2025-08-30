// backend/controllers/truckController.js
const asyncHandler = require('express-async-handler');
const Truck = require('../models/Truck'); // Import the Truck model

// You'll need access to the Socket.IO instance for real-time updates.
// We'll pass it from server.js when defining routes.
let io;
const setIoInstance = (socketIoInstance) => {
  io = socketIoInstance;
};

// @desc    Get all trucks
// @route   GET /api/trucks
// @access  Private (Admin only)
const getAllTrucks = asyncHandler(async (req, res) => {
  const trucks = await Truck.find({});
  res.status(200).json(trucks);
});

// @desc    Register a new truck (for initial registration, potentially from a driver app)
// @route   POST /api/trucks/register
// @access  Private (Admin or Driver registration)
const registerTruck = asyncHandler(async (req, res) => {
  const { truckId, driverName, plateNumber, route, latitude, longitude } = req.body;

  if (!truckId || !driverName || !plateNumber || !route || latitude == null || longitude == null) {
    res.status(400);
    throw new Error('Please enter all required fields: truckId, driverName, plateNumber, route, latitude, longitude.');
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
    plateNumber,
    route,
    currentLocation: { latitude, longitude },
    lastUpdated: Date.now(),
    status: 'active', // Default status upon registration
  });

  if (truck) {
    res.status(201).json({
      _id: truck.id,
      truckId: truck.truckId,
      driverName: truck.driverName,
      plateNumber: truck.plateNumber,
      route: truck.route,
      currentLocation: truck.currentLocation,
      status: truck.status,
    });
  } else {
    res.status(400);
    throw new Error('Invalid truck data received.');
  }
});

// @desc    Update a truck's details (Admin access)
// @route   PUT /api/trucks/:id
// @access  Private (Admin only)
const updateTruck = asyncHandler(async (req, res) => {
  const { truckId, driverName, plateNumber, route } = req.body;

  const truck = await Truck.findById(req.params.id);

  if (!truck) {
    res.status(404);
    throw new Error('Truck not found.');
  }

  // Update fields
  truck.truckId = truckId || truck.truckId;
  truck.driverName = driverName || truck.driverName;
  truck.plateNumber = plateNumber || truck.plateNumber;
  truck.route = route || truck.route;

  const updatedTruck = await truck.save();

  res.status(200).json({
    _id: updatedTruck._id,
    truckId: updatedTruck.truckId,
    driverName: updatedTruck.driverName,
    plateNumber: updatedTruck.plateNumber,
    route: updatedTruck.route,
    status: updatedTruck.status,
    message: 'Truck details updated successfully!',
  });
});

// @desc    Delete a truck
// @route   DELETE /api/trucks/:id
// @access  Private (Admin only)
const deleteTruck = asyncHandler(async (req, res) => {
  const truck = await Truck.findById(req.params.id);

  if (!truck) {
    res.status(404);
    throw new Error('Truck not found.');
  }

  await truck.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Truck removed.' });
});

// @desc    Update a truck's location (Driver app)
// @route   PUT /api/trucks/:truckId/location
// @access  Private (Driver app)
const updateTruckLocation = async (req, res) => {
  const { latitude, longitude, status } = req.body;
  const { truckId } = req.params;

  const truck = await Truck.findOneAndUpdate(
    { truckId },
    {
      currentLocation: { latitude, longitude },
      lastUpdated: Date.now(),
      status: status,
    },
    { new: true, runValidators: true }
  );

  if (!truck) {
    res.status(404);
    throw new Error('Truck not found.');
  }

  if (io) {
    io.emit('truckLocationUpdate', {
      truckId: truck.truckId,
      currentLocation: truck.currentLocation,
      lastUpdated: truck.lastUpdated,
      status: truck.status,
    });
  }

  res.json({
    truckId: truck.truckId,
    currentLocation: truck.currentLocation,
    lastUpdated: truck.lastUpdated,
    message: 'Truck location updated successfully!',
    status: truck.status,
  });
};

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
  } else {
    res.status(200).json(trucks);
  }
});

module.exports = {
  setIoInstance,
  getAllTrucks,
  createTruck: registerTruck, // <-- Fix: export registerTruck as createTruck
  updateTruck,
  deleteTruck,
  updateTruckLocation,
  getTruckLocation,
  getAllTruckLocations,
  registerTruck,
};