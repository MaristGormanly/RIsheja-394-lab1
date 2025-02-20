import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskDetailsModal from './TaskDetailsModal';
import ShareProjectModal from './ShareProjectModal';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  useEffect(() => {
    fetchProject();
    fetchProjectTasks();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setEditedTitle(project.title);
      setEditedDescription(project.description || '');
    }
  }, [project]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingTitle, isEditingDescription]);

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

  const handleTitleSubmit = async () => {
    if (editedTitle.trim() === '') return;
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle,
          description: project.description
        }),
      });

      if (!response.ok) throw new Error('Failed to update project');
      
      const updatedProject = await response.json();
      setProject(updatedProject);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDescriptionSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: project.title,
          description: editedDescription
        }),
      });

      if (!response.ok) throw new Error('Failed to update project');
      
      const updatedProject = await response.json();
      setProject(updatedProject);
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSubmit();
                  }
                }}
                className="text-2xl font-semibold w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
              />
            ) : (
              <h2
                className="text-2xl font-semibold cursor-pointer hover:text-indigo-600"
                onClick={() => setIsEditingTitle(true)}
              >
                {project?.title}
              </h2>
            )}
            {isEditingDescription ? (
              <textarea
                ref={descriptionInputRef}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onBlur={handleDescriptionSubmit}
                className="mt-2 w-full bg-transparent border border-gray-300 rounded-md focus:border-indigo-500 focus:outline-none p-2"
                rows={2}
              />
            ) : (
              <p
                className="text-gray-600 cursor-pointer hover:text-gray-800"
                onClick={() => setIsEditingDescription(true)}
              >
                {project?.description || 'Add description...'}
              </p>
            )}
          </div>
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
        <div className="flex gap-6 flex-1 min-h-0 overflow-x-auto overflow-y-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this project? This action cannot be undone and will delete all associated tasks.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails; 