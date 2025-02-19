import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskDetailsModal from './TaskDetailsModal';
import ShareProjectModal from './ShareProjectModal';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { userProfile } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({
    'TO_DO': [],
    'IN_PROGRESS': [],
    'COMPLETED': []
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchProjectTasks();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/project/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await response.json();
      
      // Group tasks by status
      const groupedTasks = {
        'TO_DO': [],
        'IN_PROGRESS': [],
        'COMPLETED': []
      };

      tasksData.forEach(task => {
        groupedTasks[task.status].push(task);
      });

      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${draggableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: destination.droppableId,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      // Update local state
      const newTasks = { ...tasks };
      const task = tasks[source.droppableId].find(t => t.id.toString() === draggableId);
      
      newTasks[source.droppableId] = tasks[source.droppableId].filter(
        t => t.id.toString() !== draggableId
      );
      
      newTasks[destination.droppableId] = [
        ...tasks[destination.droppableId].slice(0, destination.index),
        { ...task, status: destination.droppableId },
        ...tasks[destination.droppableId].slice(destination.index)
      ];

      setTasks(newTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => ({
      ...prev,
      'TO_DO': [...prev['TO_DO'], newTask]
    }));
  };

  const handleTaskSelect = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{project?.title}</h2>
          <p className="text-gray-600">{project?.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Share Project
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add New Task
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
            />
          ))}
        </div>
      </DragDropContext>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={handleTaskCreated}
          projectId={projectId}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={fetchProjectTasks}
        />
      )}

      {showShareModal && (
        <ShareProjectModal
          projectId={projectId}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetails; 