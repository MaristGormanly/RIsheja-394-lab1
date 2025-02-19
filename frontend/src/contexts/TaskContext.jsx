import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const fetchTasks = async () => {
    if (!userProfile?.id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/user/${userProfile.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const fetchedTasks = await response.json();
      
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

      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userProfile]);

  const value = {
    tasks,
    setTasks,
    fetchTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 