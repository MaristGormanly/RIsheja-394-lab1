import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

const TaskColumn = ({ title, tasks, droppableId, onTaskSelect, selectedTasks, onTaskDeleted }) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectAll = () => {
    const taskIds = tasks.map(task => task.id);
    if (selectedTasks.length === tasks.length) {
      // If all tasks are selected, deselect all
      onTaskSelect(taskIds, false);
    } else {
      // Otherwise, select all
      onTaskSelect(taskIds, true);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 rounded-lg p-4 min-h-[200px] max-h-[calc(100vh-12rem)] overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">({tasks.length})</span>
        </div>
        <button
          onClick={() => setIsSelecting(!isSelecting)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {isSelecting ? 'Cancel' : 'Select'}
        </button>
      </div>

      {isSelecting && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={tasks.length > 0 && selectedTasks.length === tasks.length}
            onChange={handleSelectAll}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">Select All</span>
        </div>
      )}

      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto scrollbar-hide space-y-4 ${
              snapshot.isDraggingOver ? 'bg-gray-200' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      transform: snapshot.isDragging
                        ? provided.draggableProps.style.transform
                        : 'none',
                    }}
                  >
                    <TaskCard
                      task={task}
                      index={index}
                      isSelecting={isSelecting}
                      isSelected={selectedTasks.includes(task.id)}
                      onSelect={(selected) => onTaskSelect([task.id], selected)}
                      onTaskDeleted={onTaskDeleted}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn; 