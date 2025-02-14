import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

const TaskColumn = ({ title, tasks, droppableId }) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-100 rounded-lg p-4 min-h-[200px] max-h-[calc(100vh-12rem)] overflow-hidden">
      <h3 className="font-medium mb-4 sticky top-0 bg-gray-100 z-10 py-2">{title}</h3>
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
                    <TaskCard task={task} />
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