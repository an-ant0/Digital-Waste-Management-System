// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // Adjust path as per your project structure

// POST /api/feedback - Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { userId, feedbackText } = req.body; // userId can be null if user is not logged in
    if (!feedbackText || feedbackText.trim().length < 10) {
      return res.status(400).json({ message: 'Feedback text is required and must be at least 10 characters long.' });
    }

    const newFeedback = new Feedback({
      userId, // Pass userId if available
      feedbackText,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!', feedback: newFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback. Please try again later.' });
  }
});

// GET /api/feedback/all - Get all feedback (for admin)
router.get('/all', async (req, res) => {
  try {
    // In a real application, you would add authentication/authorization here
    // to ensure only admins can access this route.
    const feedbackList = await Feedback.find().sort({ timestamp: -1 }); // Get all feedback, newest first
    res.status(200).json(feedbackList);
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback.' });
  }
});

module.exports = router;