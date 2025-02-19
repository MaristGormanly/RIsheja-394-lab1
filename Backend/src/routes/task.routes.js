const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');

// Place specific routes before parameterized routes
router.post('/', TaskController.createTask);
router.post('/batch', TaskController.createBatchTasks);
router.delete('/bulk-delete', TaskController.bulkDeleteTasks);

// Then place routes with parameters
router.get('/user/:userId', TaskController.getUserTasks);
router.get('/statistics/:userId', TaskController.getTaskStatistics);
router.patch('/:taskId/status', TaskController.updateTaskStatus);
router.delete('/:taskId', TaskController.deleteTask);
router.patch('/:taskId', TaskController.updateTask);
router.post('/:taskId/share', TaskController.shareTask);
router.get('/project/:projectId', TaskController.getProjectTasks);

// Update task due date
router.patch('/:taskId/due-date', TaskController.updateTaskDueDate);

module.exports = router; 