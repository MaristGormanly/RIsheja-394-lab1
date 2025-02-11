import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import { useAuth } from '../contexts/AuthContext';
import TaskDetailsModal from './TaskDetailsModal';

const TaskBoard = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState({
    'TO_DO': [],
    'IN_PROGRESS': [],
    'COMPLETED': []
  });
  const { userProfile } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks when component mounts
  useEffect(() => {
    if (userProfile?.id) {
      fetchTasks();
    }
  }, [userProfile]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/user/${userProfile.id}`);
      const data = await response.json();
      
      // Group tasks by status
      const groupedTasks = data.reduce((acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      }, {
        'TO_DO': [],
        'IN_PROGRESS': [],
        'COMPLETED': []
      });

      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => ({
      ...prev,
      'TO_DO': [...prev['TO_DO'], newTask]
    }));
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Find the moved task
    const task = tasks[source.droppableId].find(t => t.id.toString() === draggableId);

    // Create new tasks state
    const newTasks = { ...tasks };
    
    // Remove from source
    newTasks[source.droppableId] = tasks[source.droppableId].filter(
      t => t.id.toString() !== draggableId
    );
    
    // Add to destination
    newTasks[destination.droppableId] = [
      ...tasks[destination.droppableId].slice(0, destination.index),
      { ...task, status: destination.droppableId },
      ...tasks[destination.droppableId].slice(destination.index)
    ];

    // Optimistically update UI
    setTasks(newTasks);

    // Update in database
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${draggableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: destination.droppableId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
        // You might want to revert the UI state here
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert the UI state on error
      setTasks(tasks);
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(status => {
        newTasks[status] = newTasks[status].filter(task => task.id !== taskId);
      });
      return newTasks;
    });
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Tasks</h2>
        <button
          onClick={() => setShowTaskForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Add New Task
        </button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-[calc(100%-5rem)]">
          {Object.entries(tasks).map(([status, taskList]) => (
            <TaskColumn 
              key={status} 
              title={status} 
              tasks={taskList} 
              droppableId={status}
            />
          ))}
        </div>
      </DragDropContext>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
};

export default TaskBoard; 