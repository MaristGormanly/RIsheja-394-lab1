import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarContainer from './components/SidebarContainer';
import TaskBoard from './components/TaskBoard';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Statistics from './components/Statistics';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import Reports from './components/Reports';
import Orion from './components/Orion';
import Projects from './components/Projects';
import ProjectDetails from './components/ProjectDetails';
import CalendarSetupSuccess from './components/CalendarSetupSuccess';
import CalendarSetupError from './components/CalendarSetupError';

const AppContent = () => {
  const { currentUser } = useAuth();

  const PrivateRoute = ({ children }) => {
    return currentUser ? (
      <div className="flex h-screen bg-gray-50">
        <SidebarContainer />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    ) : (
      <Navigate to="/login" />
    );
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          currentUser ? <Navigate to="/projects" /> : <LoginPage />
        } />
        <Route path="/signup" element={
          currentUser ? <Navigate to="/projects" /> : <SignupPage />
        } />
        <Route path="/calendar-setup-success" element={<CalendarSetupSuccess />} />
        <Route path="/calendar-setup-error" element={<CalendarSetupError />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <Navigate to="/projects" />
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TaskBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <PrivateRoute>
              <Statistics />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/orion"
          element={
            <PrivateRoute>
              <Orion />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <PrivateRoute>
              <TaskBoard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
};

export default App; 