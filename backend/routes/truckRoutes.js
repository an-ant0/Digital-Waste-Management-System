const express = require('express');
const router = express.Router();
const {
  setIoInstance, // We'll export this to set the io instance from server.js
  registerTruck,
  updateTruckLocation,
  getTruckLocation,
  getAllTruckLocations,
} = require('../controllers/truckController');

// This function allows server.js to pass the io instance to the controller
const initializeTruckRoutes = (ioInstance) => {
  setIoInstance(ioInstance);

  // Truck Management (Admin or internal use)
  router.post('/register', registerTruck); // Register a new truck
  router.put('/:truckId/location', updateTruckLocation); // Update a specific truck's location

  // Truck Location Data (for user app)
  router.get('/:truckId/location', getTruckLocation); // Get a specific truck's latest location
  router.get('/locations/all', getAllTruckLocations); // Get all active truck locations

  return router;
};

module.exports = initializeTruckRoutes;