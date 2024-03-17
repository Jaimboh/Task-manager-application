const express = require('express');
const Notification = require('../models/Notification');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// Route to mark all notifications as read
router.post('/notifications/read', isAuthenticated, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.session.userId, read: false }, { $set: { read: true } });
    console.log(`Notifications marked as read for user ID: ${req.session.userId}`);
    res.redirect('back');
  } catch (error) {
    console.error('Error marking notifications as read:', error.message);
    console.error(error.stack);
    res.status(500).send('Error marking notifications as read.');
  }
});

module.exports = router;