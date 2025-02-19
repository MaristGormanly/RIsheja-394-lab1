import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ProjectCard = ({ project }) => {
  return (
    <Link 
      to={`/projects/${project.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <h3 className="text-xl font-medium mb-2">{project.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Created {format(new Date(project.created_at), 'MMM dd, yyyy')}</span>
        <span>{project.task_count} tasks</span>
      </div>
    </Link>
  );
};

export default ProjectCard; 