const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['work', 'personal', 'health'], required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  completionTime: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recurring: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

taskSchema.pre('save', function(next) {
  if (!this.isModified('completed') || this.completed === false) {
    this.completionTime = null; // Reset completionTime if task is not completed or being unmarked as completed
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

Task.on('index', function(error) {
  if (error) {
    console.error('Task model index error:', error.message);
    console.error(error.stack);
  } else {
    console.log('Task model indexing completed successfully.');
  }
});

module.exports = Task;