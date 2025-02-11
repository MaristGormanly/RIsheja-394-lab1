const db = require('../config/database');

class CommentModel {
  static async createComment(taskId, userId, comment) {
    const query = {
      text: `
        INSERT INTO task_comments (task_id, user_id, comment)
        VALUES ($1, $2, $3)
        RETURNING *`,
      values: [taskId, userId, comment],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error creating comment: ${error.message}`);
    }
  }

  static async getTaskComments(taskId) {
    const query = {
      text: `
        SELECT 
          tc.*,
          u.name as user_name,
          u.email as user_email
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = $1
        ORDER BY tc.created_at DESC`,
      values: [taskId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching comments: ${error.message}`);
    }
  }
}

module.exports = CommentModel; 