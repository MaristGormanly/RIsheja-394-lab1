import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import { useAuth } from '../contexts/AuthContext';
import TaskDetailsModal from './TaskDetailsModal';
import ShareProjectModal from './ShareProjectModal';

const TaskBoard = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showShareProject, setShowShareProject] = useState(false);
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
      const response = await fetch(`http://localhost:3001/api/tasks/user/${userProfile.email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasks = await response.json();
      
      // Group tasks by status
      const groupedTasks = {
        'TO_DO': [],
        'IN_PROGRESS': [],
        'COMPLETED': []
      };

      tasks.forEach(task => {
        groupedTasks[task.status].push(task);
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
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Tasks</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowShareProject(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Share Project
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Add New Task
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 flex-1 min-h-0">
          {Object.entries(tasks).map(([status, taskList]) => (
            <TaskColumn 
              key={status} 
              title={status.replace('_', ' ')} 
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

      {showShareProject && (
        <ShareProjectModal
          onClose={() => setShowShareProject(false)}
        />
      )}
    </div>
  );
};

export default TaskBoard; 