// backend/controllers/userController.js
const asyncHandler = require('express-async-handler'); // Utility for handling async errors
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // Import bcryptjs for password comparison

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // Destructure all fields from the request body
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
    res.status(400); // Bad request status
    throw new Error('Please enter all required fields.'); // Custom error message
  }

  // Check if user already exists based on email, phone, or ID number
  const userExists = await User.findOne({
    $or: [{ email }, { phone }, { idNumber }], // Check if any of these fields already exist
  });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email, phone, or ID number already exists.');
  }

  // Create new user in the database
  const user = await User.create({
    firstName,
    middleName,
    lastName,
    homeNumber,
    wardNumber,
    localityName,
    profilePic, // Stores base64 string or URL
    idType,
    idNumber,
    idPhoto, // Stores base64 string or URL
    phone,
    email,
    password, // Password will be hashed by the pre-save middleware in the User model
  });

  if (user) {
    // If user creation is successful, send back user details (excluding password)
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      message: 'User registered successfully!',
      // In a real app, you'd generate a JWT token here and send it back
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data received'); // Error if user data is invalid
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body; // User can log in with email or phone

  // --- DEBUG LOGS START --- (Keep these for now, remove in production)
  console.log('Login attempt received:');
  console.log('  emailOrPhone:', emailOrPhone);
  console.log('  password (raw):', password); // Be careful with logging raw passwords in production!
  // --- DEBUG LOGS END ---

  // Validate input
  if (!emailOrPhone || !password) {
    res.status(400);
    throw new Error('Please enter email/phone and password');
  }

  // Find user by email or phone number
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  // --- DEBUG LOGS START --- (Keep these for now, remove in production)
  if (user) {
    console.log('  User found in DB:', user.email || user.phone);
    console.log('  Stored Hashed Password:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('  Password comparison result (isMatch):', isMatch);
  } else {
    console.log('  User NOT found in DB for:', emailOrPhone);
  }
  // --- DEBUG LOGS END ---

  // Check if user exists and password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      homeNumber: user.homeNumber, // Include more fields for profile
      wardNumber: user.wardNumber,
      localityName: user.localityName,
      profilePic: user.profilePic,
      message: 'Logged in successfully!',
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Public (for now, will be Private with JWT)
const getUserProfile = asyncHandler(async (req, res) => {
  // In a real app, you'd get the user ID from a JWT token (req.user.id)
  // For now, we'll use the ID from the URL parameter for simplicity
  const userId = req.params.id;

  const user = await User.findById(userId).select('-password'); // Exclude password

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
      idType: user.idType, // Include ID type and number if needed for display
      idNumber: user.idNumber,
      idPhoto: user.idPhoto,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile/:id
// @access  Public (for now, will be Private with JWT)
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id; // User ID from URL parameter
  const user = await User.findById(userId);

  if (user) {
    // Update fields only if they are provided in the request body
    user.firstName = req.body.firstName || user.firstName;
    user.middleName = req.body.middleName || user.middleName;
    user.lastName = req.body.lastName || user.lastName;
    user.homeNumber = req.body.homeNumber || user.homeNumber;
    user.wardNumber = req.body.wardNumber || user.wardNumber;
    user.localityName = req.body.localityName || user.localityName;
    user.profilePic = req.body.profilePic || user.profilePic;
    user.phone = req.body.phone || user.phone;
    user.email = req.body.email || user.email;
    // Note: ID type, number, and photo are typically not updated via profile screen
    // Password would have a separate "change password" flow

    const updatedUser = await user.save(); // Save the updated user

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
  getUserProfile, // Export new functions
  updateUserProfile, // Export new functions
};
