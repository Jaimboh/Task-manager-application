const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../services/googleCalendarService');
const { google } = require('googleapis');
const { sendEmail } = require('../services/emailService');
const mongoose = require('mongoose');
const router = express.Router();

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, // Use environment variable for Google Client ID
  process.env.GOOGLE_CLIENT_SECRET, // Use environment variable for Google Client Secret
  process.env.GOOGLE_REDIRECT_URI // Use environment variable for Google Redirect URI
);

// Assuming a function to get the authenticated user's access token
const getAccessTokenForUser = (userId) => {
  // Implement logic to retrieve user's access token based on userId
  // This is a placeholder function and should be replaced with actual implementation
  return 'user_access_token_placeholder';
};

// POST '/tasks' - Create a new task
router.post('/tasks', isAuthenticated, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.session.userId,
      sharedWith: req.body.sharedWith ? req.body.sharedWith.split(",").map(userId => mongoose.Types.ObjectId(userId.trim())) : []
    });

    const accessToken = getAccessTokenForUser(req.session.userId);
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    if (task.dueDate) { // Check if task has a due date to add to Google Calendar
      const eventId = await createCalendarEvent(task, oauth2Client);
      task.googleEventId = eventId; // Save Google Calendar event ID to task document
      console.log(`Google Calendar event created with ID: ${eventId}`);
    }

    await task.save(); // Save the task after adding the Google Calendar event ID
    console.log(`Task created: ${task.title}`);

    // Send email notifications to shared users
    if(task.sharedWith && task.sharedWith.length > 0) {
      task.sharedWith.forEach(async userId => {
        const user = await User.findById(userId);
        if(user && user.email) {
          const emailSubject = `Task Shared With You: ${task.title}`;
          const emailBody = `You have been shared on a task titled "${task.title}" in Electra. Please login to view and manage the task.`;
          await sendEmail(user.email, emailSubject, emailBody).catch(error => console.error(`Error sending email: ${error.message}\n${error.stack}`));
        }
      });
    }

    res.status(201).send(task);
  } catch (error) {
    console.error(`Error creating task: ${error.message}\n${error.stack}`);
    res.status(400).send(error.message);
  }
});

// GET '/tasks' - List all tasks of the logged-in user
router.get('/tasks', isAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { userId: req.session.userId },
        { sharedWith: { $in: [req.session.userId] } }
      ]
    }).populate('sharedWith', 'username');
    console.log(`Fetched ${tasks.length} tasks for user ID ${req.session.userId}`);
    res.send(tasks);
  } catch (error) {
    console.error(`Error fetching tasks: ${error.message}\n${error.stack}`);
    res.status(500).send(error.message);
  }
});

// PUT '/tasks/:id' - Update a task by its ID
router.put('/tasks/:id', isAuthenticated, async (req, res) => {
  try {
    const originalTaskData = await Task.findById(req.params.id);
    if (!originalTaskData) {
      console.log(`Task not found with ID: ${req.params.id}`);
      return res.status(404).send('Task not found.');
    }
    const originalSharedWith = originalTaskData.sharedWith.map(id => id.toString());
    const updatedSharedWith = req.body.sharedWith ? req.body.sharedWith.split(",").map(userId => mongoose.Types.ObjectId(userId.trim())) : [];
    const updateData = { ...req.body, sharedWith: updatedSharedWith };

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      updateData,
      { new: true }
    );

    if (!task) {
      console.log(`Task not found with ID: ${req.params.id}`);
      return res.status(404).send('Task not found.');
    }

    const accessToken = getAccessTokenForUser(req.session.userId);
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    if (task.googleEventId) {
      await updateCalendarEvent(task.googleEventId, task, oauth2Client);
      console.log(`Google Calendar event updated for task: ${task.title}`);
    }

    // Send email notifications to newly added shared users
    updatedSharedWith.forEach(async userId => {
      if (!originalSharedWith.includes(userId.toString())) {
        const user = await User.findById(userId);
        if(user && user.email) {
          const emailSubject = `New Task Shared With You: ${task.title}`;
          const emailBody = `A task titled "${task.title}" has been shared with you in Electra. Please login to view and manage the task.`;
          await sendEmail(user.email, emailSubject, emailBody).catch(error => console.error(`Error sending email: ${error.message}\n${error.stack}`));
        }
      }
    });

    console.log(`Task updated: ${task.title}`);
    res.send(task);
  } catch (error) {
    console.error(`Error updating task: ${error.message}\n${error.stack}`);
    res.status(400).send(error.message);
  }
});

// DELETE '/tasks/:id' - Delete a task
router.delete('/tasks/:id', isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      console.log(`Task not found with ID: ${req.params.id}`);
      return res.status(404).send('Task not found.');
    }

    const accessToken = getAccessTokenForUser(req.session.userId);
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    if (task.googleEventId) {
      await deleteCalendarEvent(task.googleEventId, oauth2Client);
      console.log(`Google Calendar event deleted for task: ${task.title}`);
    }

    console.log(`Task deleted: ${task.title}`);
    res.send({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`Error deleting task: ${error.message}\n${error.stack}`);
    res.status(500).send(error.message);
  }
});

module.exports = router;