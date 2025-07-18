// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile, // Import new functions
  updateUserProfile, // Import new functions
} = require('../controllers/userController');

// User Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User Profile Routes
// GET request to fetch user profile by ID
router.get('/profile/:id', getUserProfile);
// PUT request to update user profile by ID
router.put('/profile/:id', updateUserProfile);

module.exports = router;
