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

  static async getUserComments(userId) {
    const query = {
      text: `
        SELECT 
          tc.*,
          u.name as commenter_name,
          t.title as task_title,
          t.status as task_status,
          t.priority as task_priority,
          (SELECT COUNT(*) FROM task_comments tc2 WHERE tc2.parent_comment_id = tc.id) as reply_count
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        JOIN tasks t ON tc.task_id = t.id
        WHERE (t.created_by = $1 OR t.assigned_to = $1)
          AND tc.parent_comment_id IS NULL
        ORDER BY tc.created_at DESC`,
      values: [userId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching user comments: ${error.message}`);
    }
  }

  static async createReply(parentId, taskId, userId, comment) {
    const query = {
      text: `
        INSERT INTO task_comments (
          task_id,
          user_id,
          comment,
          parent_comment_id
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
      values: [taskId, userId, comment, parentId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error creating reply: ${error.message}`);
    }
  }

  static async getCommentReplies(commentId) {
    const query = {
      text: `
        SELECT 
          tc.*,
          u.name as user_name,
          u.email as user_email
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.parent_comment_id = $1
        ORDER BY tc.created_at ASC`,
      values: [commentId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching replies: ${error.message}`);
    }
  }
}

module.exports = CommentModel; 