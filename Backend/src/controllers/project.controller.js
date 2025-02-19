const ProjectModel = require('../models/project.model');
const UserModel = require('../models/user.model');
const emailService = require('../services/email.service');

class ProjectController {
  static async createProject(req, res) {
    try {
      const projectData = {
        title: req.body.title,
        description: req.body.description,
        created_by: req.body.created_by
      };

      const project = await ProjectModel.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error('Error in createProject:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserProjects(req, res) {
    try {
      const { userId } = req.params;
      const projects = await ProjectModel.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error in getUserProjects:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getProject(req, res) {
    try {
      const { projectId } = req.params;
      const project = await ProjectModel.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      console.error('Error in getProject:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProject(req, res) {
    try {
      const { projectId } = req.params;
      const projectData = {
        title: req.body.title,
        description: req.body.description
      };

      const project = await ProjectModel.updateProject(projectId, projectData);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      console.error('Error in updateProject:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteProject(req, res) {
    try {
      const { projectId } = req.params;
      const project = await ProjectModel.deleteProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error in deleteProject:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async shareProject(req, res) {
    try {
      const { projectId } = req.params;
      const { email, creator_email } = req.body;

      // Get the project details
      const project = await ProjectModel.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Get the user being invited
      const invitedUser = await UserModel.getUserByEmail(email);
      if (!invitedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is already a collaborator
      const isCollaborator = await ProjectModel.isUserCollaborator(projectId, invitedUser.id);
      if (isCollaborator) {
        return res.status(400).json({ message: 'User is already a collaborator on this project' });
      }

      // Add user as collaborator
      await ProjectModel.addCollaborator(projectId, invitedUser.id);

      // Send email invitation
      if (email !== creator_email) {
        const creator = await UserModel.getUserByEmail(creator_email);
        await emailService.sendProjectInvitation(
          email,
          project,
          creator.name
        );
      }

      res.json({ message: 'Project shared successfully' });
    } catch (error) {
      console.error('Error in shareProject:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async removeCollaborator(req, res) {
    try {
      const { projectId } = req.params;
      const { userId } = req.body;

      const removed = await ProjectModel.removeCollaborator(projectId, userId);
      if (!removed) {
        return res.status(404).json({ message: 'Collaborator not found' });
      }

      res.json({ message: 'Collaborator removed successfully' });
    } catch (error) {
      console.error('Error in removeCollaborator:', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getProjectCollaborators(req, res) {
    try {
      const { projectId } = req.params;
      const collaborators = await ProjectModel.getProjectCollaborators(projectId);
      res.json(collaborators);
    } catch (error) {
      console.error('Error in getProjectCollaborators:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ProjectController; 