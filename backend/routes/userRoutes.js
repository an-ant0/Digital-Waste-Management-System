// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');

// User Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User Profile Routes
// GET user profile by ID
router.get('/profile/:id', getUserProfile);

// PUT update user profile by ID
router.put('/profile/:id', updateUserProfile);

module.exports = router;
