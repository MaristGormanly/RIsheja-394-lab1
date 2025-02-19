import React, { useState } from 'react';
import { FaGoogle, FaCalendar, FaSpinner } from 'react-icons/fa';

const GoogleCalendarButton = ({ taskId, isConnected, onConnect, onDisconnect }) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/google', {
        credentials: 'include' // Include credentials in the request
      });
      const data = await response.json();
      
      // Store the taskId in localStorage before redirecting
      if (taskId) {
        localStorage.setItem('pendingCalendarTaskId', taskId);
      }
      
      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/calendar`, {
        method: 'DELETE',
        credentials: 'include' // Include credentials in the request
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect calendar');
      }
      
      onDisconnect?.();
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${isConnected 
          ? 'bg-red-50 text-red-700 hover:bg-red-100' 
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : isConnected ? (
        <FaCalendar />
      ) : (
        <FaGoogle />
      )}
      <span>
        {loading
          ? 'Processing...'
          : isConnected
          ? 'Disconnect Calendar'
          : 'Connect to Calendar'}
      </span>
    </button>
  );
};

export default GoogleCalendarButton; 