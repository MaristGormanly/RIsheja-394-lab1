import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import ShareTaskModal from './ShareTaskModal';
import GoogleCalendarButton from './GoogleCalendarButton';
import { FaCalendarCheck } from 'react-icons/fa';

const TaskDetailsModal = ({ task: initialTask, onClose, onTaskDeleted, onUpdate }) => {
  const { userProfile } = useAuth();
  const [task, setTask] = useState(initialTask);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({
    assignee_email: task.assignee_email || '',
    description: task.description
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(!!task?.google_calendar_event_id);

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

  const handleEdit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignee_email: editForm.assignee_email || null,
          description: editForm.description
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      setTask(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      onTaskDeleted(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const handleCalendarDisconnect = () => {
    setCalendarConnected(false);
    onUpdate?.({ ...task, google_calendar_event_id: null });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      {showDeleteConfirm ? (
        <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Task</h3>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
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

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To (Email)
                    </label>
                    <input
                      type="email"
                      value={editForm.assignee_email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, assignee_email: e.target.value }))}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Leave empty to unassign the task
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEdit}
                      disabled={loading}
                      className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Assigned to:</span>
                        <span className="text-sm font-medium">
                          {task.assignee_email || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Created by:</span>
                        <span className="text-sm font-medium">{task.creator_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Created:</span>
                        <span className="text-sm">
                          {format(new Date(task.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Share Task
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Edit Task
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created by</h3>
                <p className="text-gray-700">{task.creator_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created at</h3>
                <p className="text-gray-700">{formatDate(task.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last updated</h3>
                <p className="text-gray-700">{formatDate(task.updated_at)}</p>
              </div>
              {task.status === 'COMPLETED' && task.completed_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Completed at</h3>
                  <p className="text-gray-700">{formatDate(task.completed_at)}</p>
                </div>
              )}
            </div>

            {/* Add Calendar Integration UI */}
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Google Calendar</span>
              <div className="flex items-center gap-2">
                {calendarConnected && (
                  <span className="flex items-center text-sm text-green-600">
                    <FaCalendarCheck className="mr-1" />
                    Synced
                  </span>
                )}
                <GoogleCalendarButton
                  taskId={task.id}
                  isConnected={calendarConnected}
                  onDisconnect={handleCalendarDisconnect}
                />
              </div>
            </div>
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

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              Delete Task
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareTaskModal
          task={task}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default TaskDetailsModal; 