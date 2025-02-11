import React from 'react';
import { format } from 'date-fns';

const TaskDetailsModal = ({ task, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-sm ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                task.status === 'TO_DO' ? 'bg-gray-100 text-gray-800' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created by</h3>
              <p className="text-gray-700">{task.creator_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned to</h3>
              <p className="text-gray-700">{task.assignee_name || 'Unassigned'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created at</h3>
              <p className="text-gray-700">{formatDate(task.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last updated</h3>
              <p className="text-gray-700">{formatDate(task.updated_at)}</p>
            </div>
          </div>

          {task.status === 'COMPLETED' && task.completed_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Completed at</h3>
              <p className="text-gray-700">{formatDate(task.completed_at)}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal; 