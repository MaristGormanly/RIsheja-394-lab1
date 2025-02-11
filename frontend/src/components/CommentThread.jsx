import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const CommentThread = ({ comment, onClose }) => {
  const { userProfile } = useAuth();
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);

  useEffect(() => {
    fetchTask();
    fetchReplies();
  }, [comment.id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${comment.task_id}`);
      const data = await response.json();
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/comments/${comment.id}/replies`);
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/comments/${comment.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.id,
          comment: newReply.trim(),
          taskId: comment.task_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reply');
      }

      const reply = await response.json();
      setReplies(prev => [...prev, reply]);
      setNewReply('');
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Comment Thread
              {replies.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </h2>
            {task && (
              <p className="text-sm text-gray-600">
                Task: {task.title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Original Comment */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-800 font-medium">
                  {comment.commenter_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-900">
                  {comment.commenter_name}
                </p>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          {replies.map((reply) => (
            <div key={reply.id} className="ml-8 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-800 font-medium">
                      {reply.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">
                      {reply.user_name}
                    </p>
                    <span className="text-sm text-gray-500">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                    {reply.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmitReply} className="mt-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Reply to this comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newReply.trim()}
              className={`px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Sending...' : 'Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentThread; 