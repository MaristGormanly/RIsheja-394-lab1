const { google } = require('googleapis');
const { oauth2Client, SCOPES } = require('../config/google.config');
const db = require('../models/db'); // Adjust this path based on your database setup

// Generate Google OAuth URL
const getAuthUrl = (req, res) => {
  console.log('Generating Google OAuth URL');
  try {
    // Store state parameter to validate callback
    const state = Math.random().toString(36).substring(7);
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: state
    });
    
    console.log('Generated OAuth URL:', url);
    res.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
};

// Handle OAuth callback
const handleCallback = async (req, res) => {
  console.log('Received Google OAuth callback');
  console.log('Query params:', req.query);
  
  const { code, state } = req.query;
  
  if (!code) {
    console.error('No code received from Google');
    return res.redirect(`${process.env.FRONTEND_URL}/#/calendar-setup-error`);
  }

  try {
    console.log('Getting tokens from Google');
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('Getting user info from Google');
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2('v2');
    const userInfo = await oauth2.userinfo.get({ auth: oauth2Client });
    
    console.log('Looking up user:', userInfo.data.email);
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [userInfo.data.email]
    );
    
    if (userResult.rows.length === 0) {
      console.error('User not found:', userInfo.data.email);
      return res.redirect(`${process.env.FRONTEND_URL}/#/calendar-setup-error`);
    }

    const userId = userResult.rows[0].id;
    
    console.log('Updating user tokens');
    await db.query(
      'UPDATE users SET google_access_token = $1, google_refresh_token = $2 WHERE id = $3',
      [tokens.access_token, tokens.refresh_token, userId]
    );
    
    console.log('Redirecting to success page');
    res.redirect(`${process.env.FRONTEND_URL}/#/calendar-setup-success`);
  } catch (error) {
    console.error('Error handling Google callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/#/calendar-setup-error`);
  }
};

// Create calendar event from task
const createCalendarEvent = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get user's tokens
    const userTokens = await db.query(
      'SELECT google_access_token, google_refresh_token FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (!userTokens.rows[0].google_access_token) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }
    
    oauth2Client.setCredentials({
      access_token: userTokens.rows[0].google_access_token,
      refresh_token: userTokens.rows[0].google_refresh_token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
      summary: task.rows[0].title,
      description: task.rows[0].description,
      start: {
        dateTime: task.rows[0].due_date,
        timeZone: 'UTC',
      },
      end: {
        dateTime: task.rows[0].due_date,
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: true
      }
    };

    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    // Store the event ID
    await db.query(
      'UPDATE tasks SET google_calendar_event_id = $1 WHERE id = $2',
      [createdEvent.data.id, taskId]
    );

    res.json(createdEvent.data);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

// Update calendar event
const updateCalendarEvent = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const userTokens = await db.query(
      'SELECT google_access_token, google_refresh_token FROM users WHERE id = $1',
      [req.user.id]
    );
    
    oauth2Client.setCredentials({
      access_token: userTokens.rows[0].google_access_token,
      refresh_token: userTokens.rows[0].google_refresh_token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
      summary: task.rows[0].title,
      description: task.rows[0].description,
      start: {
        dateTime: task.rows[0].due_date,
        timeZone: 'UTC',
      },
      end: {
        dateTime: task.rows[0].due_date,
        timeZone: 'UTC',
      }
    };

    const updatedEvent = await calendar.events.update({
      calendarId: 'primary',
      eventId: task.rows[0].google_calendar_event_id,
      resource: event,
    });

    res.json(updatedEvent.data);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

// Delete calendar event
const deleteCalendarEvent = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const userTokens = await db.query(
      'SELECT google_access_token, google_refresh_token FROM users WHERE id = $1',
      [req.user.id]
    );
    
    oauth2Client.setCredentials({
      access_token: userTokens.rows[0].google_access_token,
      refresh_token: userTokens.rows[0].google_refresh_token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: task.rows[0].google_calendar_event_id,
    });

    // Remove the event ID
    await db.query(
      'UPDATE tasks SET google_calendar_event_id = NULL WHERE id = $1',
      [taskId]
    );

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
}; 