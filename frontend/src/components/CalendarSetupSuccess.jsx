import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const CalendarSetupSuccess = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleCalendarSetup = async () => {
      // Check if there's a pending task to sync
      const pendingTaskId = localStorage.getItem('pendingCalendarTaskId');
      
      if (pendingTaskId) {
        try {
          // Create calendar event for the pending task
          const response = await fetch(`http://localhost:3001/api/tasks/${pendingTaskId}/calendar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to sync task with calendar');
          }

          // Clear the pending task ID
          localStorage.removeItem('pendingCalendarTaskId');
        } catch (error) {
          console.error('Error syncing task with calendar:', error);
        }
      }
    };

    // Handle the calendar setup
    handleCalendarSetup();

    // Set up redirect timer
    const timer = setTimeout(() => {
      navigate(currentUser ? '/tasks' : '/login');
    }, 3000);

    return () => {
      clearTimeout(timer);
      // Clean up pending task ID if component unmounts
      localStorage.removeItem('pendingCalendarTaskId');
    };
  }, [navigate, currentUser]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="mb-6">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Calendar Connected Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Your Google Calendar has been successfully connected to TaskFlow. You can now sync your tasks with your calendar.
        </p>
        <button
          onClick={() => navigate(currentUser ? '/tasks' : '/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentUser ? 'Go to Tasks' : 'Login'}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting you {currentUser ? 'back to your tasks' : 'to login'}...
        </p>
      </div>
    </div>
  );
};

export default CalendarSetupSuccess; 