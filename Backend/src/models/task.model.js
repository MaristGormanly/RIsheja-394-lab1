const db = require('../config/database');

class TaskModel {
  static async createTask(taskData) {
    const { 
      title, 
      description, 
      priority, 
      creator_email, 
      assignee_email, 
      project_id,
      status,
      due_date 
    } = taskData;
    
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
          assigned_to,
          project_id,
          due_date,
          assigned_at
        ) 
        SELECT 
          $3, $4, $5, $6, 
          creator.id,
          assignee.id,
          $7,
          $8,
          CASE WHEN assignee.id IS NOT NULL THEN CURRENT_TIMESTAMP END
        FROM creator
        LEFT JOIN assignee ON true
        RETURNING *`,
      values: [
        creator_email,
        assignee_email || null,
        title,
        description,
        status || 'TO_DO',
        priority,
        project_id,
        due_date
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
          c.email as creator_email,
          a.name as assignee_name,
          a.email as assignee_email,
          p.title as project_title
        FROM tasks t
        LEFT JOIN users c ON t.created_by = c.id
        LEFT JOIN users a ON t.assigned_to = a.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE (t.created_by = $1 OR t.assigned_to = $1)
        AND (
          t.project_id IS NULL 
          OR 
          t.project_id IN (
            SELECT id FROM projects WHERE created_by = $1
          )
        )
        ORDER BY 
          CASE 
            WHEN t.due_date IS NOT NULL THEN 0 
            ELSE 1 
          END,
          t.due_date ASC NULLS LAST,
          t.created_at DESC`,
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
            updated_at = CURRENT_TIMESTAMP,
            completed_at = CASE 
              WHEN $1 = 'COMPLETED' THEN CURRENT_TIMESTAMP
              ELSE NULL
            END
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

  static async updateTask(taskId, { assignee_email, description, due_date }) {
    const query = {
      text: `
        WITH assignee AS (
          SELECT id FROM users WHERE email = $1
          UNION ALL
          SELECT NULL WHERE $1 IS NULL
          LIMIT 1
        )
        UPDATE tasks 
        SET assigned_to = assignee.id,
            description = $2,
            due_date = $3,
            updated_at = CURRENT_TIMESTAMP,
            assigned_at = CASE 
              WHEN assignee.id IS NOT NULL AND (assigned_to IS NULL OR assigned_to != assignee.id)
              THEN CURRENT_TIMESTAMP
              ELSE assigned_at
            END
        FROM assignee
        WHERE tasks.id = $4 
        RETURNING tasks.*, 
          (SELECT name FROM users WHERE id = tasks.assigned_to) as assignee_name,
          (SELECT email FROM users WHERE id = tasks.assigned_to) as assignee_email`,
      values: [assignee_email || null, description, due_date, taskId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }

  static async deleteTask(taskId) {
    const query = {
      text: 'DELETE FROM tasks WHERE id = $1 RETURNING *',
      values: [taskId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
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

  static async getTasksByProject(projectId) {
    const query = {
      text: `
        SELECT t.*, 
          c.name as creator_name,
          c.email as creator_email,
          a.name as assignee_name,
          a.email as assignee_email,
          p.title as project_title
        FROM tasks t
        LEFT JOIN users c ON t.created_by = c.id
        LEFT JOIN users a ON t.assigned_to = a.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.project_id = $1
        ORDER BY t.created_at ASC`,
      values: [projectId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching project tasks: ${error.message}`);
    }
  }

  static async bulkDeleteTasks(taskIds, userId) {
    const query = {
      text: `
        DELETE FROM tasks 
        WHERE id = ANY($1::int[])
        AND (created_by = $2 OR assigned_to = $2)
        RETURNING *`,
      values: [taskIds, userId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error bulk deleting tasks: ${error.message}`);
    }
  }

  static async updateTaskDueDate(taskId, dueDate) {
    const query = {
      text: `
        UPDATE tasks 
        SET due_date = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING *`,
      values: [dueDate, taskId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error updating task due date: ${error.message}`);
    }
  }
}

module.exports = TaskModel;