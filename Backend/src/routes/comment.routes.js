const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');

router.post('/tasks/:taskId/comments', CommentController.createComment);
router.get('/tasks/:taskId/comments', CommentController.getTaskComments);
router.get('/users/:userId/comments', CommentController.getUserComments);
router.post('/comments/:commentId/replies', CommentController.createReply);
router.get('/comments/:commentId/replies', CommentController.getCommentReplies);

module.exports = router; 