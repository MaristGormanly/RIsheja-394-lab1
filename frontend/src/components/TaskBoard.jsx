import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import { useAuth } from '../contexts/AuthContext';
import TaskDetailsModal from './TaskDetailsModal';
import ShareProjectModal from './ShareProjectModal';
import { useTask } from '../contexts/TaskContext';

const TaskBoard = () => {
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const { projectId } = useParams();
  const location = useLocation();
  const urlProjectId = projectId || searchParams.get('projectId');
  
  const { tasks, setTasks } = useTask();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showShareProject, setShowShareProject] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [urlProjectId, userProfile]);

  const fetchTasks = async () => {
    try {
      let response;
      
      if (urlProjectId) {
        // Fetch project-specific tasks
        response = await fetch(`http://localhost:3001/api/tasks/project/${urlProjectId}`);
      } else {
        // Fetch user's tasks
        response = await fetch(`http://localhost:3001/api/tasks/user/${userProfile.id}`);
      }

      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await response.json();
      
      // Group tasks by status
      const groupedTasks = {
        'TO_DO': [],
        'IN_PROGRESS': [],
        'COMPLETED': []
      };

      tasksData.forEach(task => {
        if (groupedTasks[task.status]) {
          groupedTasks[task.status].push(task);
        }
      });

      setTasks(groupedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => ({
      ...prev,
      [newTask.status]: [...prev[newTask.status], newTask]
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

  const handleTaskSelect = (taskIds, selected) => {
    setSelectedTasks(prev => {
      if (selected) {
        return [...new Set([...prev, ...taskIds])];
      } else {
        return prev.filter(id => !taskIds.includes(id));
      }
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedTasks.length) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:3001/api/tasks/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskIds: selectedTasks,
          userId: userProfile.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete tasks');
      }

      // Remove deleted tasks from state
      setTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].filter(
            task => !selectedTasks.includes(task.id)
          );
        });
        return newTasks;
      });
      
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error deleting tasks:', error);
      // Optionally show error to user
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">My Tasks</h2>
          {selectedTasks.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedTasks.length})`}
            </button>
          )}
        </div>
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
              selectedTasks={selectedTasks}
              onTaskSelect={handleTaskSelect}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
        </div>
      </DragDropContext>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={handleTaskCreated}
          projectId={urlProjectId}
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