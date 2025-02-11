const db = require('../config/database');

class TaskModel {
  static async createTask(taskData) {
    const { title, description, priority, created_by, assigned_to } = taskData;
    
    const query = {
      text: `
        INSERT INTO tasks (
          title, 
          description, 
          status, 
          priority, 
          created_by, 
          assigned_to
        ) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
      values: [
        title, 
        description, 
        'TO_DO', // Default status for new tasks
        priority,
        created_by,
        assigned_to
      ],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
  }

  static async getTasksByUser(userId) {
    const query = {
      text: `
        SELECT t.*, 
          c.name as creator_name,
          a.name as assignee_name
        FROM tasks t
        LEFT JOIN users c ON t.created_by = c.id
        LEFT JOIN users a ON t.assigned_to = a.id
        WHERE t.created_by = $1 OR t.assigned_to = $1
        ORDER BY t.created_at DESC`,
      values: [userId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }

  static async updateTaskStatus(taskId, status) {
    const query = {
      text: `
        UPDATE tasks 
        SET status = $1, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *`,
      values: [status, taskId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error updating task status: ${error.message}`);
    }
  }
}

module.exports = TaskModel; 