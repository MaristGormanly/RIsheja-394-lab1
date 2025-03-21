import React from 'react';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaTasks, FaCalendar, FaSignOutAlt, FaChartBar, FaRobot, FaFileAlt } from 'react-icons/fa';

const TaskSidebar = ({ project }) => {
  // Hooks and context for authentication, navigation, and routing
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  // Handle user logout and redirect to login page
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Check if the current path matches the given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Generate CSS classes for navigation links, highlighting active link
  const navLinkClass = (path) => `
    flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100
    ${isActive(path) ? 'bg-gray-100 font-medium' : ''}
  `;

  // Append projectId to navigation paths if it exists
  const getProjectPath = (path) => {
    return projectId ? `${path}?projectId=${projectId}` : path;
  };

  return (
    // Main sidebar container
    <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      {/* Home link section */}
      <div className="flex items-center mb-8">
        <Link to="/projects" className="text-gray-500 hover:text-gray-700 flex items-center">
          <FaHome className="mr-2" />
          Home
        </Link>
      </div>
      
      {/* Main navigation menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {/* Navigation items including new Tasks link */}
          <li>
            <Link 
              to={projectId ? `/projects/${projectId}` : '/projects'}
              className={navLinkClass(projectId ? `/projects/${projectId}` : '/projects')}
            >
              <FaTasks className="mr-2" />
              <span>Tasks</span>
            </Link>
          </li>
          <li>
            <Link 
              to={projectId ? `/projects/${projectId}/calendar` : '/calendar'}
              className={navLinkClass('/calendar')}
            >
              <FaCalendar className="mr-2" />
              <span>Calendar</span>
            </Link>
          </li>
          <li>
            <Link 
              to={projectId ? `/projects/${projectId}/statistics` : '/statistics'}
              className={navLinkClass(projectId ? `/projects/${projectId}/statistics` : '/statistics')}
            >
              <FaChartBar className="mr-2" />
              <span>Statistics</span>
            </Link>
          </li>
          <li>
            <Link 
              to={projectId ? `/projects/${projectId}/orion` : '/orion'}
              className={navLinkClass(projectId ? `/projects/${projectId}/orion` : '/orion')}
            >
              <FaRobot className="mr-2" />
              <span>Orion AI</span>
            </Link>
          </li>
          <li>
            <Link 
              to={projectId ? `/projects/${projectId}/reports` : '/reports'}
              className={navLinkClass(projectId ? `/projects/${projectId}/reports` : '/reports')}
            >
              <FaFileAlt className="mr-2" />
              <span>Reports</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User profile and logout section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium text-gray-900">{userProfile?.name || 'User'}</p>
          <p className="text-sm text-gray-500">{userProfile?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
        >
          <FaSignOutAlt className="mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default TaskSidebar; 