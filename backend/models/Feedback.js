// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // If you want to link feedback to specific users
    ref: 'User', // Reference to a User model if you have one
    default: null, // Feedback can be anonymous if no user is logged in
  },
  feedbackText: {
    type: String,
    required: true,
    trim: true,
    minlength: 10, // Matches your frontend validation
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields if needed, e.g., 'status', 'adminNotes', 'rating'
});

module.exports = mongoose.model('Feedback', feedbackSchema);