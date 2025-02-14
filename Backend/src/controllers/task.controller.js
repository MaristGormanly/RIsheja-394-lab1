const TaskModel = require('../models/task.model');

class TaskController {
  static async createTask(req, res) {
    try {
      const taskData = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        creator_email: req.body.creator_email,
        assignee_email: req.body.assignee_email
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
      const userEmail = req.params.email;
      const tasks = await TaskModel.getTasksByEmail(userEmail);
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

  static async getTaskStatistics(req, res) {
    try {
      const { userId } = req.params;
      const statistics = await TaskModel.getTaskStatistics(userId);
      res.json(statistics);
    } catch (error) {
      console.error('Error in getTaskStatistics:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteTask(req, res) {
    try {
      const { taskId } = req.params;
      const { userId } = req.body;

      const deletedTask = await TaskModel.deleteTask(taskId, userId);
      
      if (!deletedTask) {
        return res.status(404).json({ 
          message: 'Task not found or you don\'t have permission to delete it' 
        });
      }

      res.json({ message: 'Task deleted successfully', task: deletedTask });
    } catch (error) {
      console.error('Error in deleteTask:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async createBatchTasks(req, res) {
    try {
      const { tasks } = req.body;
      
      const createdTasks = await Promise.all(
        tasks.map(task => TaskModel.createTask(task))
      );

      res.status(201).json(createdTasks);
    } catch (error) {
      console.error('Error in createBatchTasks:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async updateTaskAssignment(req, res) {
    try {
      const { taskId } = req.params;
      const { assignee_email, description } = req.body;

      const task = await TaskModel.updateTaskAssignment(taskId, { 
        assignee_email, 
        description 
      });
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error in updateTaskAssignment:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = TaskController; 