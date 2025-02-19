const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
const aiRoutes = require('./routes/ai.routes');
const projectRoutes = require('./routes/project.routes');
const calendarRoutes = require('./routes/calendar.routes');
//const taskCommentRoutes = require('./routes/taskComment.routes');
//const taskActivityRoutes = require('./routes/taskActivity.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend requests
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount all routes under /api
const router = express.Router();

// Mount sub-routes
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/ai', aiRoutes);
router.use('/projects', projectRoutes);

// Mount calendar routes at the root level of the router
router.use('/', calendarRoutes);

// Mount the main router under /api
app.use('/api', router);

const PORT = process.env.PORT || 3001;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app; 