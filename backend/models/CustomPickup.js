// backend/models/CustomPickup.js
const mongoose = require('mongoose');

const customPickupSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Refers to the User model
    },
    address: {
      type: String,
      required: [true, 'Address is required for custom pickup'],
    },
    date: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: ['Morning (6:00 AM - 10:00 AM)', 'Afternoon (12:00 PM - 4:00 PM)', 'Evening (5:00 PM - 7:00 PM)'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid'],
      default: 'Unpaid',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CustomPickup', customPickupSchema);
