// backend/controllers/customPickupController.js
const asyncHandler = require('express-async-handler');
const CustomPickup = require('../models/CustomPickup'); // Import the CustomPickup model

// @desc    Create a new custom pickup request
// @route   POST /api/custompickups
// @access  Private (e.g., user token required)
const createCustomPickup = asyncHandler(async (req, res) => {
  const { userId, address, date, timeSlot, paymentStatus, price } = req.body;

  if (!userId || !address || !date || !timeSlot || !price) {
    res.status(400);
    throw new Error('Please include all required fields for custom pickup.');
  }

  const customPickup = await CustomPickup.create({
    user: userId,
    address,
    date,
    timeSlot,
    price,
    paymentStatus: paymentStatus || 'Unpaid', // Default to Unpaid
    status: 'Pending', // Default status
  });

  if (customPickup) {
    res.status(201).json({
      _id: customPickup._id,
      user: customPickup.user,
      address: customPickup.address,
      date: customPickup.date,
      timeSlot: customPickup.timeSlot,
      price: customPickup.price,
      paymentStatus: customPickup.paymentStatus,
      status: customPickup.status,
      message: 'Custom pickup request created successfully.',
    });
  } else {
    res.status(400);
    throw new Error('Invalid custom pickup data.');
  }
});

// @desc    Get all custom pickup requests (Admin access)
// @route   GET /api/custompickups
// @access  Private (Admin only)
const getCustomPickups = asyncHandler(async (req, res) => {
  const pickups = await CustomPickup.find({}).populate('user', 'firstName lastName phone email'); // Populate user details

  res.status(200).json(pickups);
});

// @desc    Get custom pickup requests for a specific user
// @route   GET /api/custompickups/user/:userId
// @access  Private (User or Admin)
const getCustomPickupsByUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const pickups = await CustomPickup.find({ user: userId });

  if (pickups) {
    res.status(200).json(pickups);
  } else {
    res.status(404);
    throw new Error('No custom pickups found for this user.');
  }
});


// @desc    Update custom pickup request status (e.g., mark as completed)
// @route   PUT /api/custompickups/:id/status
// @access  Private (Admin only)
const updateCustomPickupStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // Expected status: 'Completed'

  const customPickup = await CustomPickup.findById(req.params.id);

  if (!customPickup) {
    res.status(404);
    throw new Error('Custom pickup request not found.');
  }

  customPickup.status = status;
  const updatedCustomPickup = await customPickup.save();

  res.status(200).json({
    _id: updatedCustomPickup._id,
    status: updatedCustomPickup.status,
    message: 'Custom pickup status updated.',
  });
});

// @desc    Update custom pickup payment status (Admin access)
// @route   PUT /api/custompickups/:id/payment
// @access  Private (Admin only)
const updateCustomPickupPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body; // Expected paymentStatus: 'Paid'

  const customPickup = await CustomPickup.findById(req.params.id);

  if (!customPickup) {
    res.status(404);
    throw new Error('Custom pickup request not found.');
  }

  customPickup.paymentStatus = paymentStatus;
  const updatedCustomPickup = await customPickup.save();

  res.status(200).json({
    _id: updatedCustomPickup._id,
    paymentStatus: updatedCustomPickup.paymentStatus,
    message: 'Custom pickup payment status updated.',
  });
});

// @desc    Delete a custom pickup request
// @route   DELETE /api/custompickups/:id
// @access  Private (Admin or user who created it)
const deleteCustomPickup = asyncHandler(async (req, res) => {
  const customPickup = await CustomPickup.findById(req.params.id);

  if (!customPickup) {
    res.status(404);
    throw new Error('Custom pickup request not found.');
  }

  await customPickup.deleteOne(); // Use deleteOne() instead of remove()
  res.status(200).json({ message: 'Custom pickup request removed.' });
});

module.exports = {
  createCustomPickup,
  getCustomPickups,
  updateCustomPickupStatus,
  deleteCustomPickup,
  getCustomPickupsByUser,
  updateCustomPickupPaymentStatus,
};