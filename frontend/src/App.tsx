import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GroupPage from './pages/GroupPage';
import FriendPage from './pages/FriendPage';

const App: React.FC = () => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/me" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/groups/:groupId" 
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/friends/:friendId" 
          element={
            <ProtectedRoute>
              <FriendPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated() ? 
              <Navigate to="/dashboard" /> : 
              <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App; 