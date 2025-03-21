import React, { useState } from 'react';
import TaskDetailsModal from './TaskDetailsModal';
import { format } from 'date-fns';

const TaskCard = ({ task, index, isSelecting, isSelected, onSelect, onTaskDeleted }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClick = (e) => {
    // If we're in selection mode, don't show details
    if (!isSelecting) {
      setShowDetails(true);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <>
      <div
        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        {isSelecting && (
          <div className="mb-2" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
          </div>
        )}
        <h4 className="font-medium mb-2">{task.title}</h4>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className="text-sm text-gray-600">{task.assignee_email || 'Unassigned'}</span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          {task.created_at && (
            <div>Created: {formatDate(task.created_at)}</div>
          )}
          {task.due_date && (
            <div className="font-medium text-indigo-600">Due: {formatDate(task.due_date)}</div>
          )}
        </div>
      </div>

      {showDetails && (
        <TaskDetailsModal
          task={task}
          onClose={() => setShowDetails(false)}
          onTaskDeleted={onTaskDeleted}
        />
      )}
    </>
  );
};

export default TaskCard; 