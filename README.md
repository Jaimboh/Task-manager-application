# Electra

Electra is an innovative To-Do Overview Application designed to help users track, manage, and review their daily routines and tasks. It allows for categorization of tasks into different aspects of life such as work, personal, and health. Electra supports recurring tasks, task prioritization, and completion time tracking, offering a comprehensive dashboard for productivity analysis. With multi-user support, it promotes sharing and collaboration among friends, and its integration with Google Calendar ensures effective scheduling and reminders.

## Overview

Electra is built as a web application using the Node.js platform with Express framework on the backend, and EJS view engine, Bootstrap for styling, and Vanilla JavaScript on the frontend. It leverages MongoDB with Mongoose ORM for efficient data management. The app features email and password-based user authentication and integrates with the Google Calendar API for task scheduling and reminders, also boasting an in-app notification system for task reminders.

## Features

- **User Authentication:** Secure login and registration with password reset functionality.
- **Task Management:** Users can create, edit, delete, categorize, and prioritize tasks, tracking completion times for productivity analysis.
- **Reminders and Notifications:** In-app notifications for task due dates.
- **Google Calendar Integration:** Tasks with due dates can be synchronized with Google Calendar for better scheduling.
- **Productivity Dashboard:** Visual dashboard displaying tasks completion and productivity trends.
- **Multi-User Support:** Each user has their own tasks, categories, and dashboard, with the ability to share tasks with friends.

## Getting started

### Requirements

- Node.js
- MongoDB
- Basic knowledge of JavaScript and Node.js environments

### Quickstart

1. Clone the repository and navigate to the project directory.
2. Copy `.env.example` to `.env` and fill in your MongoDB URL, PORT, and SESSION_SECRET.
3. Run `npm install` to install dependencies.
4. Execute `node server.js` to start the application.
5. Open a browser and navigate to `http://localhost:<PORT>` to view the app.

### License

Copyright (c) 2024.