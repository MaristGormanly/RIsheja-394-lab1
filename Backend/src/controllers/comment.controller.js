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
}

module.exports = CommentController; 