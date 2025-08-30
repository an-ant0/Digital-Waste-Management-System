// backend/models/Truck.js
const mongoose = require('mongoose');

const truckSchema = mongoose.Schema(
  {
    truckId: { // A unique identifier for the truck, e.g., license plate, internal ID
      type: String,
      required: [true, 'Truck ID is required'],
      unique: true,
      trim: true,
    },
    driverName: {
      type: String,
      required: [true, 'Driver name is required'],
    },
    plateNumber: { // Added plateNumber field
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true,
    },
    route: { // Added route field
      type: String,
      required: [true, 'Route is required'],
      trim: true,
    },
    // Current location of the truck
    currentLocation: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },
    status: { // e.g., 'active', 'inactive', 'maintenance'
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    lastUpdated: { // To track when the location was last updated
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('Truck', truckSchema);