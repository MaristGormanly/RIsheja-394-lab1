const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public Google OAuth routes (no auth required)
router.get('/auth/google', calendarController.getAuthUrl);
router.get('/auth/google/callback', calendarController.handleCallback);

// Protected calendar event routes (auth required)
router.post('/tasks/:taskId/calendar', authMiddleware, calendarController.createCalendarEvent);
router.put('/tasks/:taskId/calendar', authMiddleware, calendarController.updateCalendarEvent);
router.delete('/tasks/:taskId/calendar', authMiddleware, calendarController.deleteCalendarEvent);

// Add a test route to verify the router is mounted correctly
router.get('/auth/google/test', (req, res) => {
  res.json({ message: 'Calendar routes are working' });
});

module.exports = router; 