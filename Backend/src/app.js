const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/user.routes');
//const taskRoutes = require('./routes/task.routes');
//const taskCommentRoutes = require('./routes/taskComment.routes');
//const taskActivityRoutes = require('./routes/taskActivity.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
//app.use('/api/tasks', taskRoutes);
//app.use('/api/comments', taskCommentRoutes);
//app.use('/api/activity', taskActivityRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

module.exports = app; 