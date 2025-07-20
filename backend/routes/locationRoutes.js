const express = require('express');
const router = express.Router();

// In-memory store (consider replacing with MongoDB for production)
let latestLocation = {
  latitude: null,
  longitude: null,
  updatedAt: null,
};

// ✅ POST /api/location — Admin shares current location
router.post('/', (req, res) => {
  const { latitude, longitude } = req.body;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return res.status(400).json({ error: 'Latitude and longitude must be valid numbers.' });
  }

  latestLocation = {
    latitude,
    longitude,
    updatedAt: new Date(),
  };

  res.status(200).json({
    message: 'Location updated successfully',
    data: latestLocation,
  });
});

// ✅ GET /api/location — User fetches latest location
router.get('/', (req, res) => {
  if (
    latestLocation.latitude === null ||
    latestLocation.longitude === null
  ) {
    return res.status(404).json({ error: 'No location has been shared yet.' });
  }

  res.status(200).json(latestLocation);
});

module.exports = router;
