const mongoose = require('mongoose');

const WasteReportSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true, // Assuming reports are always linked to a user
    },
    userName: { // Added for easier display in admin panels
      type: String,
      required: true,
    },
    wasteType: {
      type: String,
      required: [true, 'Please add a waste type'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'], // GeoJSON type
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please add coordinates'],
      },
      address: {
        type: String,
        required: [true, 'Please add an address'],
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the admin User who reviewed it
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    pointsAwarded: { // To track points given for this report
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('WasteReport', WasteReportSchema);