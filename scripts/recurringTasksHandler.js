const mongoose = require('mongoose');
require('dotenv').config(); // Adjusted to use the default .env path
const Task = require('../models/Task');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully for recurring tasks handler'))
  .catch(err => {
    console.error('Database connection error in recurring tasks handler:', err.message);
    process.exit(1);
  });

const duplicateRecurringTasks = async () => {
  try {
    const tasks = await Task.find({ recurring: { $ne: 'none' }, completed: true });
    tasks.forEach(async (task) => {
      const newTask = new Task(task.toObject());
      newTask._id = mongoose.Types.ObjectId(); // assign a new ID
      newTask.isNew = true; // mark as new for Mongoose
      newTask.completed = false;
      newTask.completionTime = null;

      switch (task.recurring) {
        case 'daily':
          newTask.dueDate.setDate(newTask.dueDate.getDate() + 1);
          break;
        case 'weekly':
          newTask.dueDate.setDate(newTask.dueDate.getDate() + 7);
          break;
        case 'monthly':
          newTask.dueDate.setMonth(newTask.dueDate.getMonth() + 1);
          break;
        default:
          console.log(`Unhandled recurring type: ${task.recurring}`);
      }

      await newTask.save();
      console.log(`Duplicated task: ${newTask.title} for ${task.recurring} recurrence`);
    });
  } catch (error) {
    console.error('Error duplicating recurring tasks:', error.message);
    console.error(error.stack);
  }
};

const runDaily = () => {
  setInterval(() => {
    const now = new Date();
    console.log(`Running recurring tasks handler at ${now.toISOString()}`);
    duplicateRecurringTasks();
  }, 86400000); // 24 hours in milliseconds
};

runDaily();