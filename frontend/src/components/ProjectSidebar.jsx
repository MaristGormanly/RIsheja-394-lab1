import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProjectSidebar = () => {
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100
    ${isActive(path) ? 'bg-gray-100 font-medium' : ''}
  `;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="flex items-center mb-8">
        <h1 className="text-xl font-semibold">Projects</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/projects" 
              className={navLinkClass('/projects')}
            >
              <span>All Projects</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium text-gray-900">{userProfile?.name || 'User'}</p>
          <p className="text-sm text-gray-500">{userProfile?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ProjectSidebar; 