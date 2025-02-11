const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');

router.post('/', TaskController.createTask);
router.get('/user/:userId', TaskController.getUserTasks);
router.patch('/:taskId/status', TaskController.updateTaskStatus);

module.exports = router; 