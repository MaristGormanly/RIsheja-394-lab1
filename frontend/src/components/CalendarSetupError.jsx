import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const CalendarSetupError = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Automatically redirect after 5 seconds
    const timer = setTimeout(() => {
      // If user is logged in, go to tasks, otherwise go to login
      navigate(currentUser ? '/tasks' : '/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, currentUser]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="mb-6">
          <FaExclamationCircle className="text-red-500 text-6xl mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Calendar Connection Failed
        </h1>
        <p className="text-gray-600 mb-6">
          We encountered an error while trying to connect your Google Calendar. Please try again later or contact support if the problem persists.
        </p>
        <button
          onClick={() => navigate(currentUser ? '/tasks' : '/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentUser ? 'Return to Tasks' : 'Login'}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting you {currentUser ? 'back to your tasks' : 'to login'} in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default CalendarSetupError; 