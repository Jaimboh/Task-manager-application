// routes/dashboardRoutes.js

const express = require('express');
const Task = require('../models/Task');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Fetch all tasks for the user
    const tasks = await Task.find({ userId: userId });

    // Count completed and pending tasks
    const completedTasksCount = tasks.filter(task => task.completed).length;
    const pendingTasksCount = tasks.filter(task => !task.completed).length;

    // Aggregate tasks for today, this week, and this month
    const stats = await Task.aggregate([
      { $match: { userId: userId, completed: true } },
      {
        $project: {
          day: { $dayOfMonth: "$completionTime" },
          month: { $month: "$completionTime" },
          year: { $year: "$completionTime" },
          completionTime: 1 // Include completionTime for further calculations
        }
      },
      {
        $facet: {
          "today": [
            { $match: { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() } }
          ],
          "thisWeek": [
            { $match: { 
              $expr: {
                $and: [
                  { $gte: ["$completionTime", new Date(new Date() - 7 * 24 * 60 * 60 * 1000)] },
                  { $lte: ["$completionTime", new Date()] }
                ]
              }
            }}
          ],
          "thisMonth": [
            { $match: { month: new Date().getMonth() + 1, year: new Date().getFullYear() } }
          ],
        }
      }
    ]);

    console.log(`Dashboard stats calculated for user ID ${userId}`);

    // Render the dashboard view with aggregated data
    res.render('dashboard', {
      stats: stats[0],
      completedTasksCount,
      pendingTasksCount,
      tasks // Include tasks for potential future use in the dashboard
    });
  } catch (error) {
    console.error(`Error fetching data for dashboard: ${error.message}\n${error.stack}`);
    res.status(500).send('Unable to load dashboard. Please try again later.');
  }
});

module.exports = router;