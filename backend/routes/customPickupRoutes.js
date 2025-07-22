// backend/routes/customPickupRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCustomPickup,
  getCustomPickups,
  updateCustomPickupStatus,
  deleteCustomPickup,
  getCustomPickupsByUser,
  updateCustomPickupPaymentStatus,
} = require('../controllers/customPickupController');

// Routes for Custom Pickup Requests

// POST /api/custompickups
// @desc    Create a new custom pickup request
// @access  Private (User) - Requires user authentication
router.post('/', createCustomPickup);

// GET /api/custompickups
// @desc    Get all custom pickup requests (for Admin)
// @access  Private (Admin) - Requires admin authentication
router.get('/', getCustomPickups);

// GET /api/custompickups/user/:userId
// @desc    Get custom pickup requests for a specific user
// @access  Private (User or Admin) - Requires authentication for the specific user or admin
router.get('/user/:userId', getCustomPickupsByUser);

// PUT /api/custompickups/:id/status
// @desc    Update custom pickup request status (e.g., mark as 'Completed' or 'Cancelled')
// @access  Private (Admin only)
router.put('/:id/status', updateCustomPickupStatus);

// PUT /api/custompickups/:id/payment
// @desc    Update custom pickup payment status (e.g., mark as 'Paid')
// @access  Private (Admin only)
router.put('/:id/payment', updateCustomPickupPaymentStatus);

// DELETE /api/custompickups/:id
// @desc    Delete a custom pickup request
// @access  Private (Admin or the user who created it)
router.delete('/:id', deleteCustomPickup);

module.exports = router;