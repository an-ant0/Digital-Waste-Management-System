const asyncHandler = require('express-async-handler');
const CustomPickup = require('../models/CustomPickup');
const User = require('../models/User'); 

const createCustomPickup = asyncHandler(async (req, res) => {
  const { userId, address, date, timeSlot, price } = req.body;

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
    paymentStatus: 'Unpaid',
    status: 'Pending', 
  });

  if (customPickup) {
    const createdPickup = await CustomPickup.findById(customPickup._id).populate('user', 'firstName lastName phone email');
    res.status(201).json({
      _id: createdPickup._id,
      user: createdPickup.user,
      address: createdPickup.address,
      date: createdPickup.date,
      timeSlot: createdPickup.timeSlot,
      price: createdPickup.price,
      paymentStatus: createdPickup.paymentStatus,
      status: createdPickup.status,
      message: 'Custom pickup request created successfully.',
    });
  } else {
    res.status(400);
    throw new Error('Invalid custom pickup data received.');
  }
});

const getCustomPickups = asyncHandler(async (req, res) => {
  const customPickups = await CustomPickup.find({}).populate('user', 'firstName lastName phone email').sort({ createdAt: -1 });

  if (customPickups && customPickups.length > 0) {
    res.status(200).json(customPickups);
  } else {
    res.status(404).json({ message: 'No custom pickup requests found.' });
  }
});

const updateCustomPickupStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const customPickup = await CustomPickup.findById(req.params.id);

  if (!customPickup) {
    res.status(404);
    throw new Error('Custom pickup request not found.');
  }

  if (customPickup.status !== 'Pending') {
    res.status(400);
    throw new Error('This request has already been processed.');
  }

  if (status === 'Completed' && customPickup.paymentStatus === 'Paid') {
    const POINTS_PER_PICKUP = 100;
    await User.findByIdAndUpdate(customPickup.user, { $inc: { points: POINTS_PER_PICKUP } });
    console.log(`Awarded ${POINTS_PER_PICKUP} points to user ${customPickup.user} for a completed custom pickup.`);
  }

  customPickup.status = status;
  const updatedCustomPickup = await customPickup.save();

  res.status(200).json({
    _id: updatedCustomPickup._id,
    status: updatedCustomPickup.status,
    message: 'Custom pickup request status updated.',
  });
});

const updateCustomPickupPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body; 

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

const deleteCustomPickup = asyncHandler(async (req, res) => {
  const customPickup = await CustomPickup.findById(req.params.id);

  if (!customPickup) {
    res.status(404);
    throw new Error('Custom pickup request not found.');
  }

  await customPickup.deleteOne(); 
  res.status(200).json({ message: 'Custom pickup request removed.' });
});

const getCustomPickupsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userPickups = await CustomPickup.find({ user: userId }).sort({ createdAt: -1 });

  if (!userPickups || userPickups.length === 0) {
    res.status(404).json({ message: 'No custom pickup requests found for this user.' });
  } else {
    res.status(200).json(userPickups);
  }
});

module.exports = {
  createCustomPickup,
  getCustomPickups,
  updateCustomPickupStatus,
  deleteCustomPickup,
  getCustomPickupsByUser,
  updateCustomPickupPaymentStatus,
};