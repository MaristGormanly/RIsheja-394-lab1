const CommentModel = require('../models/comment.model');

class CommentController {
  static async createComment(req, res) {
    try {
      const { taskId } = req.params;
      const { userId, comment } = req.body;

      const newComment = await CommentModel.createComment(taskId, userId, comment);
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error in createComment:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getTaskComments(req, res) {
    try {
      const { taskId } = req.params;
      const comments = await CommentModel.getTaskComments(taskId);
      res.json(comments);
    } catch (error) {
      console.error('Error in getTaskComments:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserComments(req, res) {
    try {
      const { userId } = req.params;
      const comments = await CommentModel.getUserComments(userId);
      res.json(comments);
    } catch (error) {
      console.error('Error in getUserComments:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async createReply(req, res) {
    try {
      const { commentId } = req.params;
      const { userId, comment, taskId } = req.body;

      const reply = await CommentModel.createReply(commentId, taskId, userId, comment);
      res.status(201).json(reply);
    } catch (error) {
      console.error('Error in createReply:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getCommentReplies(req, res) {
    try {
      const { commentId } = req.params;
      const replies = await CommentModel.getCommentReplies(commentId);
      res.json(replies);
    } catch (error) {
      console.error('Error in getCommentReplies:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CommentController; 