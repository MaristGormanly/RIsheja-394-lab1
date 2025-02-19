const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/project.controller');

router.post('/', ProjectController.createProject);
router.get('/user/:userId', ProjectController.getUserProjects);
router.get('/:projectId', ProjectController.getProject);
router.put('/:projectId', ProjectController.updateProject);
router.delete('/:projectId', ProjectController.deleteProject);

// Collaboration routes
router.post('/:projectId/share', ProjectController.shareProject);
router.delete('/:projectId/collaborators', ProjectController.removeCollaborator);
router.get('/:projectId/collaborators', ProjectController.getProjectCollaborators);

module.exports = router; 