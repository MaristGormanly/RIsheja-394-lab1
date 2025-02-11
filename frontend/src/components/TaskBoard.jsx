import React from 'react';
import TaskColumn from './TaskColumn';

const TaskBoard = () => {
  const columns = [
    {
      title: 'To Do',
      tasks: [
        { id: 1, title: 'Update website design', priority: 'High', assignee: 'John D.' },
        { id: 2, title: 'Create meeting presentation', priority: 'Medium', assignee: 'Sarah M.' }
      ]
    },
    {
      title: 'In Progress',
      tasks: [
        { id: 3, title: 'Mobile app development', priority: 'Medium', assignee: 'Mike R.' }
      ]
    },
    {
      title: 'Completed',
      tasks: [
        { id: 4, title: 'Bug fixes', priority: 'Low', assignee: 'Emma S.' }
      ]
    }
  ];

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Tasks</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          + Add New Task
        </button>
      </div>
      
      <div className="flex gap-6 h-[calc(100%-5rem)]">
        {columns.map((column, index) => (
          <TaskColumn key={index} title={column.title} tasks={column.tasks} />
        ))}
      </div>
    </div>
  );
};

export default TaskBoard; 