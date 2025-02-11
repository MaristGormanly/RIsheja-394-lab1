import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import { differenceInHours } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const { userProfile } = useAuth();
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchTaskStatistics();
    }
  }, [userProfile]);

  const fetchTaskStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/statistics/${userProfile.id}`);
      const data = await response.json();
      setTaskStats(data);
    } catch (error) {
      console.error('Error fetching task statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !taskStats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  // Completion Rate Chart Data
  const completionRateData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [
          taskStats.completedCount,
          taskStats.inProgressCount,
          taskStats.todoCount
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(156, 163, 175, 0.6)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Completion Time Chart Data
  const completionTimeData = {
    labels: taskStats.completionTimes.map(t => t.title),
    datasets: [
      {
        label: 'Completion Time (hours)',
        data: taskStats.completionTimes.map(t => 
          differenceInHours(new Date(t.completed_at), new Date(t.created_at))
        ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const completionTimeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Completion Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours to Complete',
        },
      },
    },
  };

  const completionRateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Status Distribution',
      },
    },
  };

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-semibold mb-6">Task Statistics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Doughnut data={completionRateData} options={completionRateOptions} />
        </div>

        {/* Task Completion Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Line data={completionTimeData} options={completionTimeOptions} />
        </div>

        {/* Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {taskStats.totalTasks ? 
                `${Math.round((taskStats.completedCount / taskStats.totalTasks) * 100)}%` 
                : '0%'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {taskStats.completedCount} of {taskStats.totalTasks} tasks completed
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Average Completion Time</h3>
            <p className="text-3xl font-bold text-blue-600">
              {taskStats.averageCompletionTime ? 
                `${Math.round(taskStats.averageCompletionTime)} hrs` 
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Average time to complete tasks
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tasks in Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {taskStats.inProgressCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Currently active tasks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 