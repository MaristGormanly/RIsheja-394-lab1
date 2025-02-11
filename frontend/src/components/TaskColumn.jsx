import React from 'react';
import TaskCard from './TaskCard';

const TaskColumn = ({ title, tasks }) => {
  return (
    <div className="flex-1 bg-gray-100 rounded-lg p-4">
      <h3 className="font-medium mb-4">{title}</h3>
      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn; 