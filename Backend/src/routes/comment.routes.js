const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');

router.post('/tasks/:taskId/comments', CommentController.createComment);
router.get('/tasks/:taskId/comments', CommentController.getTaskComments);

module.exports = router; 