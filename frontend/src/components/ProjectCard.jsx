import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';

const ProjectCard = ({ project, onUpdate }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      onUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Link 
              to={`/projects/${project.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
            >
              {project.title}
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete Project"
            >
              <FaTrash />
            </button>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Created {format(new Date(project.created_at), 'MMM dd, yyyy')}</span>
            <span>{project.task_count} tasks</span>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete "{project.title}"? This action cannot be undone and will delete all associated tasks.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectCard; 