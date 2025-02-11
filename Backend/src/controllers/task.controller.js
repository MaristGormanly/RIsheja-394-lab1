const TaskModel = require('../models/task.model');

class TaskController {
  static async createTask(req, res) {
    try {
      const taskData = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to
      };

      const task = await TaskModel.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error('Error in createTask:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserTasks(req, res) {
    try {
      const userId = req.params.userId;
      const tasks = await TaskModel.getTasksByUser(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Error in getUserTasks:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async updateTaskStatus(req, res) {
    try {
      const { taskId } = req.params;
      const { status } = req.body;

      if (!['TO_DO', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const task = await TaskModel.updateTaskStatus(taskId, status);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = TaskController; 