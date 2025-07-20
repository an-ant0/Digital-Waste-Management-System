const asyncHandler = require('express-async-handler'); // Middleware to catch errors in async routes
const User = require('../models/User'); // User model
const bcrypt = require('bcryptjs'); // For password hashing/comparison

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    homeNumber,
    wardNumber,
    localityName,
    profilePic,
    idType,
    idNumber,
    idPhoto,
    phone,
    email,
    password,
  } = req.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !homeNumber ||
    !wardNumber ||
    !localityName ||
    !idType ||
    !idNumber ||
    !idPhoto ||
    !phone ||
    !email ||
    !password
  ) {
    res.status(400);
    throw new Error('Please enter all required fields.');
  }

  // Check if user exists with same email, phone, or ID number
  const userExists = await User.findOne({
    $or: [{ email }, { phone }, { idNumber }],
  });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email, phone, or ID number already exists.');
  }

  // Create user (password hashing done by model pre-save middleware)
  const user = await User.create({
    firstName,
    middleName,
    lastName,
    homeNumber,
    wardNumber,
    localityName,
    profilePic,
    idType,
    idNumber,
    idPhoto,
    phone,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      message: 'User registered successfully!',
      // Optionally generate and send JWT token here
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data received');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    res.status(400);
    throw new Error('Please enter email/phone and password');
  }

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      homeNumber: user.homeNumber,
      wardNumber: user.wardNumber,
      localityName: user.localityName,
      profilePic: user.profilePic,
      role: user.role,
      message: 'Logged in successfully!',
      // Optionally send JWT token here
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Public (should be Private with JWT in production)
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      homeNumber: user.homeNumber,
      wardNumber: user.wardNumber,
      localityName: user.localityName,
      profilePic: user.profilePic,
      phone: user.phone,
      email: user.email,
      idType: user.idType,
      idNumber: user.idNumber,
      idPhoto: user.idPhoto,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile by ID
// @route   PUT /api/users/profile/:id
// @access  Public (should be Private with JWT in production)
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.middleName = req.body.middleName || user.middleName;
    user.lastName = req.body.lastName || user.lastName;
    user.homeNumber = req.body.homeNumber || user.homeNumber;
    user.wardNumber = req.body.wardNumber || user.wardNumber;
    user.localityName = req.body.localityName || user.localityName;
    user.profilePic = req.body.profilePic || user.profilePic;
    user.phone = req.body.phone || user.phone;
    user.email = req.body.email || user.email;
    // ID details and password update to be handled separately

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      middleName: updatedUser.middleName,
      lastName: updatedUser.lastName,
      homeNumber: updatedUser.homeNumber,
      wardNumber: updatedUser.wardNumber,
      localityName: updatedUser.localityName,
      profilePic: updatedUser.profilePic,
      phone: updatedUser.phone,
      email: updatedUser.email,
      message: 'Profile updated successfully!',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
