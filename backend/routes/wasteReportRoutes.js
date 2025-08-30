const express = require('express');
const router = express.Router();
const WasteReport = require('../models/WasteReport');
const User = require('../models/User'); // Import User model to update points
// You'll likely have some middleware for authentication/authorization later
// const { protect, authorize } = require('../middleware/authMiddleware'); // Example

// @desc    Submit a new waste report
// @route   POST /api/waste/report
// @access  Private (user) - assuming user is logged in
router.post('/report', async (req, res) => {
  try {
    const { userId, userName, wasteType, description, imageUrl, location } = req.body;

    if (!userId || !userName || !wasteType || !description || !imageUrl || !location) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const newReport = await WasteReport.create({
      userId,
      userName,
      wasteType,
      description,
      imageUrl,
      location,
    });

    res.status(201).json({ message: 'Waste report submitted successfully', report: newReport });
  } catch (error) {
    console.error('Error submitting waste report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all pending waste reports for admin review
// @route   GET /api/waste/pending
// @access  Private (admin)
router.get('/pending', async (req, res) => {
  try {
    const pendingReports = await WasteReport.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.status(200).json(pendingReports);
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get a user's waste report history
// @route   GET /api/waste/history/user/:userId
// @access  Private (user)
router.get('/history/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userReports = await WasteReport.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(userReports);
  } catch (error) {
    console.error('Error fetching user report history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all reviewed waste reports (for admin history)
// @route   GET /api/waste/history/admin
// @access  Private (admin)
router.get('/history/admin', async (req, res) => {
  try {
    const reviewedReports = await WasteReport.find({ status: { $ne: 'Pending' } }).sort({ reviewedAt: -1, createdAt: -1 });
    res.status(200).json(reviewedReports);
  } catch (error) {
    console.error('Error fetching admin review history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Approve or reject a waste report
// @route   PUT /api/waste/:id/review
// @access  Private (admin)
router.put('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy } = req.body; // reviewedBy should be the admin's ID

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const report = await WasteReport.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Waste report not found.' });
    }

    if (report.status !== 'Pending') {
      return res.status(400).json({ message: 'Report has already been reviewed.' });
    }

    report.status = status;
    report.reviewedBy = reviewedBy;
    report.reviewedAt = new Date();

    let pointsAwarded = 0;
    if (status === 'Approved') {
      // Award points for approved reports (e.g., 50 points per approved report)
      const POINTS_PER_REPORT = 50;
      report.pointsAwarded = POINTS_PER_REPORT;
      pointsAwarded = POINTS_PER_REPORT;

      // Update user's points
      await User.findByIdAndUpdate(report.userId, { $inc: { points: POINTS_PER_REPORT } });
    } else {
      report.pointsAwarded = 0; // No points for rejected reports
    }

    await report.save();

    res.status(200).json({ message: `Report ${status} successfully`, report, pointsAwarded });
  } catch (error) {
    console.error('Error reviewing waste report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;