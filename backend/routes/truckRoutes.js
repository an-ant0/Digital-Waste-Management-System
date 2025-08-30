const express = require('express');
const router = express.Router();
const {
  setIoInstance, 
  getAllTrucks,
  createTruck,
  updateTruck,
  deleteTruck,
  updateTruckLocation,
  getTruckLocation,
  getAllTruckLocations,
} = require('../controllers/truckController');

const initializeTruckRoutes = (ioInstance) => {
  setIoInstance(ioInstance);

  // CRUD Routes for Truck Management
  router.route('/').get(getAllTrucks).post(createTruck);
  router.route('/:id').put(updateTruck).delete(deleteTruck);

  // Order matters: Register specific routes before dynamic ones
  router.get('/locations/all', getAllTruckLocations); // Must be before :truckId

  // Location routes
  router.post('/update-location', updateTruckLocation); // must be a function
  router.get('/:truckId/location', getTruckLocation);

  return router;
};

module.exports = initializeTruckRoutes;
