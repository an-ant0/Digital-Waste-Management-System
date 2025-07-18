// backend/models/User.js
const mongoose = require('mongoose'); // Import Mongoose
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

// Define the User Schema
const userSchema = mongoose.Schema(
  {
    // Personal Information from SignupScreen1
    firstName: {
      type: String,
      required: [true, 'First name is required'], // First name is mandatory
    },
    middleName: {
      type: String,
      default: '', // Middle name is optional, default to empty string
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'], // Last name is mandatory
    },

    // Address Information from SignupScreen1
    homeNumber: {
      type: String,
      required: [true, 'Home number is required'], // Home number is mandatory
    },
    wardNumber: {
      type: String,
      required: [true, 'Ward number is required'], // Ward number is mandatory
    },
    localityName: {
      type: String,
      required: [true, 'Locality name is required'], // Locality name is mandatory
    },

    // Identity and Profile Information from SignupScreen2
    profilePic: {
      type: String, // Store as base64 string or URL
      default: '', // Optional profile picture
    },
    idType: {
      type: String,
      required: [true, 'ID type is required'], // e.g., Citizenship, Passport, VoterID
    },
    idNumber: {
      type: String,
      required: [true, 'ID number is required'],
      unique: true, // ID number must be unique for each user
    },
    idPhoto: {
      type: String, // Store as base64 string or URL
      required: [true, 'ID photo is required'], // ID photo is mandatory
    },

    // Contact and Authentication Information from SignupScreen3
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true, // Phone number must be unique
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Email must be unique
      match: [/.+@.+\..+/, 'Please enter a valid email address'], // Basic email format validation
    },
    password: {
      type: String,
      required: [true, 'Password is required'], // Hashed password
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

// Middleware to hash password before saving the user
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next(); // Move to the next middleware
  }

  // Generate a salt with 10 rounds
  const salt = await bcrypt.genSalt(10);
  // Hash the password using the generated salt
  this.password = await bcrypt.hash(this.password, salt);
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
