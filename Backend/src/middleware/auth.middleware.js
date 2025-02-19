const db = require('../models/db');

const authMiddleware = async (req, res, next) => {
  try {
    // Get the user ID from the request headers or session
    const userId = req.headers['user-id'] || req.session?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware; 