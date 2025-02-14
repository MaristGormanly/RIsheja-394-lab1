const db = require('../config/database');

class TaskModel {
  static async createTask(taskData) {
    const { title, description, priority, creator_email, assignee_email } = taskData;
    
    const query = {
      text: `
        WITH creator AS (
          SELECT id FROM users WHERE email = $1
        ),
        assignee AS (
          SELECT id FROM users WHERE email = $2
        )
        INSERT INTO tasks (
          title, 
          description, 
          status, 
          priority, 
          created_by, 
          assigned_to
        ) 
        SELECT 
          $3, $4, 'TO_DO', $5, 
          creator.id,
          assignee.id
        FROM creator
        LEFT JOIN assignee ON true
        RETURNING *`,
      values: [
        creator_email,
        assignee_email || null,
        title,
        description,
        priority
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
        ORDER BY t.created_at ASC`,
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

  static async getTaskStatistics(userId) {
    const queries = {
      counts: `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'TO_DO') as todo_count,
          COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_count,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
          COUNT(*) as total_count
        FROM tasks 
        WHERE created_by = $1 OR assigned_to = $1
      `,
      completionTimes: `
        SELECT 
          title,
          created_at,
          completed_at,
          EXTRACT(EPOCH FROM (completed_at - created_at))/3600 as completion_time
        FROM tasks 
        WHERE (created_by = $1 OR assigned_to = $1)
          AND status = 'COMPLETED'
          AND completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT 10
      `,
      averageTime: `
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_completion_time
        FROM tasks 
        WHERE (created_by = $1 OR assigned_to = $1)
          AND status = 'COMPLETED'
          AND completed_at IS NOT NULL
      `
    };

    try {
      const [counts, completionTimes, avgTime] = await Promise.all([
        db.query(queries.counts, [userId]),
        db.query(queries.completionTimes, [userId]),
        db.query(queries.averageTime, [userId])
      ]);

      return {
        todoCount: parseInt(counts.rows[0].todo_count),
        inProgressCount: parseInt(counts.rows[0].in_progress_count),
        completedCount: parseInt(counts.rows[0].completed_count),
        totalTasks: parseInt(counts.rows[0].total_count),
        completionTimes: completionTimes.rows,
        averageCompletionTime: avgTime.rows[0].avg_completion_time
      };
    } catch (error) {
      throw new Error(`Error fetching task statistics: ${error.message}`);
    }
  }

  static async deleteTask(taskId, userId) {
    const query = {
      text: `
        DELETE FROM tasks 
        WHERE id = $1 
        AND (created_by = $2 OR assigned_to = $2)
        RETURNING *`,
      values: [taskId, userId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  static async getTasksByEmail(email) {
    const query = {
      text: `
        SELECT t.*, 
          c.name as creator_name,
          c.email as creator_email,
          a.name as assignee_name,
          a.email as assignee_email
        FROM tasks t
        LEFT JOIN users c ON t.created_by = c.id
        LEFT JOIN users a ON t.assigned_to = a.id
        WHERE c.email = $1 OR a.email = $1
        ORDER BY t.created_at ASC`,
      values: [email],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }
}

module.exports = TaskModel; 