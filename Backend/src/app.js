const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
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

// Routes
app.use('/api', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', commentRoutes);
//app.use('/api/comments', taskCommentRoutes);
//app.use('/api/activity', taskActivityRoutes);

const PORT = process.env.PORT || 3001;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app; 