const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully for inserting sample tasks'))
  .catch(err => {
    console.error('Database connection error in insertSampleTasks script:', err.message);
    process.exit(1);
  });

const createSampleTasks = async () => {
  try {
    // Fetch a user to associate with tasks
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in the database. Please ensure at least one user exists.');
      return;
    }
    const userId = user._id;

    const sampleTasks = [
      {
        title: 'Morning Jog',
        description: 'Jog around the park for 30 minutes.',
        category: 'health',
        priority: 'medium',
        dueDate: new Date(),
        completed: false,
        userId: userId,
      },
      {
        title: 'Project Meeting',
        description: 'Weekly project status meeting with the team.',
        category: 'work',
        priority: 'high',
        dueDate: new Date(),
        completed: false,
        userId: userId,
      },
      {
        title: 'Read a Book',
        description: 'Finish reading the current chapter of the book.',
        category: 'personal',
        priority: 'low',
        dueDate: new Date(),
        completed: false,
        userId: userId,
      }
    ];

    await Task.insertMany(sampleTasks);
    console.log('Sample tasks inserted successfully');
  } catch (error) {
    console.error('Error inserting sample tasks:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

createSampleTasks();