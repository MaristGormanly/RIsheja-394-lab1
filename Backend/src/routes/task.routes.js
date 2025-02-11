const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');

router.post('/', TaskController.createTask);
router.get('/user/:userId', TaskController.getUserTasks);
router.patch('/:taskId/status', TaskController.updateTaskStatus);
router.get('/statistics/:userId', TaskController.getTaskStatistics);

module.exports = router; 