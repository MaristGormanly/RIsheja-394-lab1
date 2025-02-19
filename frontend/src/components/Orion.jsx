import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

const TaskPreview = ({ task, onConfirm, onCancel }) => {
  if (!task) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-lg mb-2">{task.title}</h3>
      <p className="text-gray-600 mb-3">{task.description}</p>
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs ${
          task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
        <span className="text-gray-500 text-sm">
          Estimated: {task.estimated_time} hours
        </span>
      </div>
    </div>
  );
};

const Orion = () => {
  const { userProfile } = useAuth();
  const { setTasks, fetchTasks } = useTask();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Orion, your AI project planning assistant. Tell me about your project, and I'll help break it down into manageable tasks."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleConfirmTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: generatedTasks.map(task => ({
            ...task,
            creator_email: userProfile.email
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tasks');
      }

      // Fetch all tasks to ensure consistency
      await fetchTasks();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Great! I've added these tasks to your dashboard. Would you like to generate more tasks or modify anything else?"
      }]);
      setGeneratedTasks(null);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error while creating the tasks. Please try again."
      }]);
    }
  };

  const handleCancelTasks = () => {
    setGeneratedTasks(null);
    setShowConfirmation(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "No problem! Let me know if you'd like to try generating different tasks."
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectDescription: userMessage,
          userId: userProfile.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate tasks');
      }

      const data = await response.json();
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('No tasks received from the server');
      }

      const validTasks = data.tasks.filter(task => 
        task && 
        typeof task.title === 'string' && task.title.trim() !== '' &&
        typeof task.description === 'string' && task.description.trim() !== '' &&
        ['HIGH', 'MEDIUM', 'LOW'].includes(task.priority) &&
        typeof task.estimated_time === 'number' && task.estimated_time > 0
      );

      if (validTasks.length === 0) {
        throw new Error('No valid tasks were generated. Please try again with a more detailed description.');
      }

      setGeneratedTasks(validTasks);
      setShowConfirmation(true);
      
      const taskList = validTasks.map(task => 
        `• ${task.title} (${task.priority} priority, ${task.estimated_time}hrs)\n  ${task.description}`
      ).join('\n\n');

      const assistantMessage = 
        "I've generated the following tasks for your project. Would you like me to add these to your dashboard?\n\n" +
        taskList;

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please try describing your project in more detail.`
      }]);
      setGeneratedTasks(null);
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-2xl font-semibold">Orion AI Assistant</h2>
        <p className="text-gray-600">Let me help you plan your projects and create tasks.</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 mb-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">
                  {message.content}
                </pre>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showConfirmation && generatedTasks && generatedTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Would you like to add these tasks to your dashboard?</h3>
          <div className="space-y-4 mb-6">
            {generatedTasks.map((task, index) => (
              task ? <TaskPreview key={index} task={task} /> : null
            ))}
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancelTasks}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmTasks}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Add to Dashboard
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your project..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Orion; 