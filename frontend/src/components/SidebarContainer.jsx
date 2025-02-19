import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import ProjectSidebar from './ProjectSidebar';
import TaskSidebar from './TaskSidebar';

const SidebarContainer = () => {
  const location = useLocation();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const urlProjectId = projectId || searchParams.get('projectId');

  useEffect(() => {
    const fetchProject = async () => {
      if (urlProjectId) {
        try {
          const response = await fetch(`http://localhost:3001/api/projects/${urlProjectId}`);
          if (!response.ok) throw new Error('Failed to fetch project');
          const data = await response.json();
          setProject(data);
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      }
    };

    fetchProject();
  }, [urlProjectId]);

  // Only show ProjectSidebar for the projects list page
  const showProjectSidebar = location.pathname === '/projects';

  return showProjectSidebar ? (
    <ProjectSidebar />
  ) : (
    <TaskSidebar project={project} />
  );
};

export default SidebarContainer; 