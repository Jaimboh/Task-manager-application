const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const createCalendarEvent = async (task, auth) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: task.dueDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(new Date(task.dueDate).getTime() + 3600000).toISOString(), // Assuming 1-hour tasks
        timeZone: 'UTC',
      },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    console.log('Event created: %s', res.data.htmlLink);
    return res.data.id; // Return the event ID
  } catch (error) {
    console.error('Failed to create calendar event:', error.message);
    console.error(error.stack);
    throw error;
  }
};

const updateCalendarEvent = async (taskId, task, auth) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: task.dueDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(new Date(task.dueDate).getTime() + 3600000).toISOString(), // Assuming 1-hour tasks
        timeZone: 'UTC',
      },
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId: taskId,
      resource: event,
    });
    console.log('Event updated');
  } catch (error) {
    console.error('Failed to update calendar event:', error.message);
    console.error(error.stack);
    throw error;
  }
};

const deleteCalendarEvent = async (eventId, auth) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    console.log('Event deleted');
  } catch (error) {
    console.error('Failed to delete calendar event:', error.message);
    console.error(error.stack);
    throw error;
  }
};

module.exports = {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
};