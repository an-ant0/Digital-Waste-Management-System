const mongoose = require('mongoose');

const RedemptionRequestSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rewardType: { // e.g., 'NCELL_RECHARGE', 'NTC_RECHARGE', 'GARBAGE_BAG'
      type: String,
      required: true,
    },
    pointsRedeemed: {
      type: Number,
      required: true,
    },
    phoneNumber: { // If applicable for recharge cards
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'], // Added 'Fulfilled' for completed redemptions
      default: 'Pending',
    },
    adminNotes: { // For admin to add details like recharge code
      type: String,
      default: null,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    fulfilledAt: { // When the redemption was actually processed by admin
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RedemptionRequest', RedemptionRequestSchema);