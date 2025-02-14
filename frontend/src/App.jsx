import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TaskBoard from './components/TaskBoard';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Statistics from './components/Statistics';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Reports from './components/Reports';
import Orion from './components/Orion';

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { currentUser } = useAuth();

  const PrivateRoute = ({ children }) => {
    return currentUser ? (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
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
        <Route path="/login" element={
          currentUser ? <Navigate to="/" /> : <LoginPage />
        } />
        <Route path="/signup" element={
          currentUser ? <Navigate to="/" /> : <SignupPage />
        } />
        <Route
          path="/"
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
      </Routes>
    </Router>
  );
};

export default App; 