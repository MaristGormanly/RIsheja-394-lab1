import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTask = () => {
  return useContext(TaskContext);
};

export const TaskProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState({
    'TO_DO': [],
    'IN_PROGRESS': [],
    'COMPLETED': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (userId = userProfile?.id) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('TaskContext: Fetching tasks for user:', userId); // Debug log
      
      const response = await fetch(`http://localhost:3001/api/tasks/user/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const fetchedTasks = await response.json();
      console.log('TaskContext: Received tasks:', fetchedTasks); // Debug log
      
      // Group tasks by status
      const groupedTasks = {
        'TO_DO': [],
        'IN_PROGRESS': [],
        'COMPLETED': []
      };

      fetchedTasks.forEach(task => {
        if (groupedTasks[task.status]) {
          groupedTasks[task.status].push(task);
        }
      });

      console.log('TaskContext: Grouped tasks:', groupedTasks); // Debug log
      setTasks(groupedTasks);
    } catch (error) {
      console.error('TaskContext: Error fetching tasks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  // Initial fetch when user profile is loaded
  useEffect(() => {
    if (userProfile?.id) {
      console.log('TaskContext: Initial fetch for user:', userProfile.id); // Debug log
      fetchTasks(userProfile.id);
    }
  }, [userProfile?.id, fetchTasks]);

  const addTask = useCallback((newTask) => {
    console.log('TaskContext: Adding new task:', newTask); // Debug log
    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[newTask.status] = [...(prev[newTask.status] || []), newTask];
      return newTasks;
    });
  }, []);

  const updateTask = useCallback((taskId, updatedTask) => {
    console.log('TaskContext: Updating task:', taskId, updatedTask); // Debug log
    setTasks(prev => {
      const newTasks = { ...prev };
      // Remove from all status arrays
      Object.keys(newTasks).forEach(status => {
        newTasks[status] = newTasks[status].filter(task => task.id !== taskId);
      });
      // Add to correct status array
      newTasks[updatedTask.status] = [...(newTasks[updatedTask.status] || []), updatedTask];
      return newTasks;
    });
  }, []);

  const value = {
    tasks,
    setTasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider; 