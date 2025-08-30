const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RedemptionRequest = require('../models/RedemptionRequest');
// const { protect, authorize } = require('../middleware/authMiddleware'); // Example

// @desc    Get user's current points
// @route   GET /api/users/:userId/points
// @access  Private (user)
router.get('/users/:userId/points', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('points');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ points: user.points });
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Submit a reward redemption request
// @route   POST /api/rewards/redeem
// @access  Private (user)
router.post('/redeem', async (req, res) => {
  try {
    const { userId, userName, rewardType, pointsRedeemed, phoneNumber } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.points < pointsRedeemed) {
      return res.status(400).json({ message: 'Not enough points to redeem this reward.' });
    }

    // Deduct points from user
    user.points -= pointsRedeemed;
    await user.save();

    // Create a new redemption request
    const newRequest = await RedemptionRequest.create({
      userId,
      userName,
      rewardType,
      pointsRedeemed,
      phoneNumber,
      status: 'Pending',
    });

    res.status(201).json({ message: 'Redemption request submitted successfully.', request: newRequest });
  } catch (error) {
    console.error('Error submitting redemption request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all pending redemption requests (for admin)
// @route   GET /api/rewards/redemptions/pending
// @access  Private (admin)
router.get('/redemptions/pending', async (req, res) => {
  try {
    const pendingRequests = await RedemptionRequest.find({ status: 'Pending' }).sort({ requestedAt: -1 });
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending redemption requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update status of a redemption request (for admin)
// @route   PUT /api/rewards/redemptions/:id/status
// @access  Private (admin)
router.put('/redemptions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['Approved', 'Rejected', 'Fulfilled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const request = await RedemptionRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Redemption request not found.' });
    }

    // If rejecting a request that was pending, refund points
    if (status === 'Rejected' && request.status === 'Pending') {
      await User.findByIdAndUpdate(request.userId, { $inc: { points: request.pointsRedeemed } });
    }

    request.status = status;
    request.adminNotes = adminNotes || request.adminNotes;
    if (status === 'Fulfilled') {
        request.fulfilledAt = new Date();
    }
    await request.save();

    res.status(200).json({ message: `Redemption request status updated to ${status}`, request });
  } catch (error) {
    console.error('Error updating redemption request status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get a user's redemption history
// @route   GET /api/rewards/redemptions/user/:userId
// @access  Private (user)
router.get('/redemptions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRedemptions = await RedemptionRequest.find({ userId }).sort({ requestedAt: -1 });
    res.status(200).json(userRedemptions);
  } catch (error) {
    console.error('Error fetching user redemption history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;