const TaskModel = require('../models/task.model');
const emailService = require('../services/email.service');
const UserModel = require('../models/user.model');

class TaskController {
  static async createTask(req, res) {
    try {
      const taskData = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        creator_email: req.body.creator_email,
        assignee_email: req.body.assignee_email,
        project_id: req.body.project_id,
        status: req.body.status,
        due_date: req.body.due_date
      };

      const task = await TaskModel.createTask(taskData);

      // Send email notification if there's an assignee
      if (taskData.assignee_email && taskData.assignee_email !== taskData.creator_email) {
        const creator = await UserModel.getUserByEmail(taskData.creator_email);
        await emailService.sendTaskInvitation(
          taskData.assignee_email,
          task,
          creator.name
        );
      }

      res.status(201).json(task);
    } catch (error) {
      console.error('Error in createTask:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserTasks(req, res) {
    try {
      const { userId } = req.params;
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

  static async shareTask(req, res) {
    try {
      const { taskId } = req.params;
      const { email, creator_email } = req.body;

      const task = await TaskModel.updateTaskAssignment(taskId, { 
        assignee_email: email,
        description: undefined // Keep existing description
      });
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Send email notification to the newly assigned user
      if (email !== creator_email) {
        const creator = await UserModel.getUserByEmail(creator_email);
        await emailService.sendTaskInvitation(
          email,
          task,
          creator.name
        );
      }

      res.json(task);
    } catch (error) {
      console.error('Error in shareTask:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async bulkDeleteTasks(req, res) {
    try {
      const { taskIds, userId } = req.body;
      
      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ message: 'No tasks specified for deletion' });
      }

      const deletedTasks = await TaskModel.bulkDeleteTasks(taskIds, userId);
      
      res.json({ 
        message: 'Tasks deleted successfully', 
        deletedCount: deletedTasks.length 
      });
    } catch (error) {
      console.error('Error in bulkDeleteTasks:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getProjectTasks(req, res) {
    try {
      const { projectId } = req.params;
      const tasks = await TaskModel.getTasksByProject(projectId);
      res.json(tasks);
    } catch (error) {
      console.error('Error in getProjectTasks:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async updateTaskDueDate(req, res) {
    try {
      const { taskId } = req.params;
      const { due_date } = req.body;

      const task = await TaskModel.updateTaskDueDate(taskId, due_date);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error in updateTaskDueDate:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async updateTask(req, res) {
    try {
      const { taskId } = req.params;
      const { assignee_email, description, due_date } = req.body;

      const task = await TaskModel.updateTask(taskId, {
        assignee_email,
        description,
        due_date
      });
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error in updateTask:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = TaskController; 