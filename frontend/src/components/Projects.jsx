import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';

const Projects = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchProjects();
    }
  }, [userProfile]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/user/${userProfile.id}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project}
            onUpdate={fetchProjects}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={fetchProjects}
        />
      )}
    </div>
  );
};

export default Projects; 