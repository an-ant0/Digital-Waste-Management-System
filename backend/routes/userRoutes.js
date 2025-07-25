const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserBlockStatus,
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile/:id', getUserProfile);
router.put('/profile/:id', updateUserProfile);

router.get('/all', getAllUsers);
router.put('/:id/block', updateUserBlockStatus);

module.exports = router;