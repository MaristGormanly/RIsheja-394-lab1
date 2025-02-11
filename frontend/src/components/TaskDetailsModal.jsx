import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const TaskDetailsModal = ({ task, onClose }) => {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task.id}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.id,
          comment: newComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-sm ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                task.status === 'TO_DO' ? 'bg-gray-100 text-gray-800' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {task.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created by</h3>
              <p className="text-gray-700">{task.creator_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned to</h3>
              <p className="text-gray-700">{task.assignee_name || 'Unassigned'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created at</h3>
              <p className="text-gray-700">{formatDate(task.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last updated</h3>
              <p className="text-gray-700">{formatDate(task.updated_at)}</p>
            </div>
          </div>

          {task.status === 'COMPLETED' && task.completed_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Completed at</h3>
              <p className="text-gray-700">{formatDate(task.completed_at)}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
          
          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className={`px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900">{comment.user_name}</span>
                  <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal; 