const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');

router.post('/', TaskController.createTask);
router.get('/user/:email', TaskController.getUserTasks);
router.patch('/:taskId/status', TaskController.updateTaskStatus);
router.get('/statistics/:userId', TaskController.getTaskStatistics);
router.delete('/:taskId', TaskController.deleteTask);
router.post('/batch', TaskController.createBatchTasks);
router.patch('/:taskId/assign', TaskController.updateTaskAssignment);
router.post('/:taskId/share', TaskController.shareTask);

module.exports = router; 