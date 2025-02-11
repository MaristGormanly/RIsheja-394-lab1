import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import TaskDetailsModal from './TaskDetailsModal';
import CommentThread from './CommentThread';

const Reports = () => {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    if (userProfile?.id) {
      fetchComments();
    }
  }, [userProfile]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userProfile.id}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task details');
      }
      const task = await response.json();
      setSelectedTask(task);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-semibold mb-6">Task Comments Report</h2>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className="p-6 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedComment(comment)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTask(comment.task_id);
                    }}
                    className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {comment.task_title}
                  </button>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comment.task_priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      comment.task_priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {comment.task_priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comment.task_status === 'TO_DO' ? 'bg-gray-100 text-gray-800' :
                      comment.task_status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {comment.task_status.replace('_', ' ')}
                    </span>
                    {comment.reply_count > 0 && (
                      <span className="text-xs text-gray-500">
                        {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-800 font-medium">
                      {comment.commenter_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">
                    {comment.commenter_name}
                  </p>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No comments found
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {selectedComment && (
        <CommentThread
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
        />
      )}
    </div>
  );
};

export default Reports; 