import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GroupPage from './pages/GroupPage';
import FriendPage from './pages/FriendPage';
import InterestsSelection from './pages/InterestsSelection';

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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route 
            path="/interests-selection" 
            element={
              <ProtectedRoute>
                <InterestsSelection />
              </ProtectedRoute>
            } 
          />
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
    </AuthProvider>
  );
}

export default App; 