const db = require('../config/database');

class ProjectModel {
  static async createProject(projectData) {
    const { title, description, created_by } = projectData;
    
    const query = {
      text: `
        INSERT INTO projects (title, description, created_by)
        VALUES ($1, $2, $3)
        RETURNING *`,
      values: [title, description, created_by],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  }

  static async getProjectsByUser(userId) {
    const query = {
      text: `
        SELECT 
          p.*,
          COUNT(t.id) as task_count,
          u.name as creator_name
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id
        JOIN users u ON p.created_by = u.id
        WHERE p.created_by = $1
        GROUP BY p.id, u.name
        ORDER BY p.created_at DESC`,
      values: [userId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  }

  static async getProjectById(projectId) {
    const query = {
      text: `
        SELECT 
          p.*,
          u.name as creator_name,
          COUNT(t.id) as task_count
        FROM projects p
        JOIN users u ON p.created_by = u.id
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.id = $1
        GROUP BY p.id, u.name`,
      values: [projectId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
  }

  static async updateProject(projectId, projectData) {
    const { title, description } = projectData;
    
    const query = {
      text: `
        UPDATE projects
        SET 
          title = $1,
          description = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *`,
      values: [title, description, projectId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  }

  static async deleteProject(projectId) {
    const query = {
      text: 'DELETE FROM projects WHERE id = $1 RETURNING *',
      values: [projectId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  }

  static async addCollaborator(projectId, userId, role = 'member') {
    const query = {
      text: `
        INSERT INTO project_collaborators (project_id, user_id, role)
        VALUES ($1, $2, $3)
        RETURNING *`,
      values: [projectId, userId, role],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error adding collaborator: ${error.message}`);
    }
  }

  static async removeCollaborator(projectId, userId) {
    const query = {
      text: `
        DELETE FROM project_collaborators
        WHERE project_id = $1 AND user_id = $2
        RETURNING *`,
      values: [projectId, userId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error removing collaborator: ${error.message}`);
    }
  }

  static async getProjectCollaborators(projectId) {
    const query = {
      text: `
        SELECT 
          pc.*,
          u.name,
          u.email
        FROM project_collaborators pc
        JOIN users u ON pc.user_id = u.id
        WHERE pc.project_id = $1`,
      values: [projectId],
    };

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching project collaborators: ${error.message}`);
    }
  }

  static async isUserCollaborator(projectId, userId) {
    const query = {
      text: `
        SELECT EXISTS (
          SELECT 1 FROM project_collaborators
          WHERE project_id = $1 AND user_id = $2
        ) as is_collaborator`,
      values: [projectId, userId],
    };

    try {
      const { rows } = await db.query(query);
      return rows[0].is_collaborator;
    } catch (error) {
      throw new Error(`Error checking collaborator status: ${error.message}`);
    }
  }
}

module.exports = ProjectModel; 