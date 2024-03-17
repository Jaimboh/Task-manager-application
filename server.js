// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const Task = require('./models/Task');
const Notification = require('./models/Notification');

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use(async (req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (req.session.userId) {
    try {
      const unreadNotifications = await Notification.find({ userId: req.session.userId, read: false });
      res.locals.notifications = unreadNotifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.locals.notifications = [];
    }
  }
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Task Management Routes
app.use(taskRoutes);

// Notification Routes
app.use(notificationRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Function to check tasks and create notifications
async function checkTasksAndNotify() {
  try {
    const upcomingTasks = await Task.find({
      dueDate: { $lte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) },
      completed: false
    });

    for (const task of upcomingTasks) {
      const message = `Reminder: Task '${task.title}' is due soon.`;
      await Notification.create({
        userId: task.userId,
        message: message,
        read: false
      });
    }
  } catch (error) {
    console.error('Error checking tasks for notifications:', error);
  }
}

// Run this process every hour
setInterval(checkTasksAndNotify, 3600000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});