import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { InterviewProblemPage } from './components/interview/InterviewProblem';
import { VideoInterviewScreen } from './components/interview/VideoInterviewScreen';
import { InterviewResultsPage } from './components/interview/InterviewResultsPage';
import { Home } from './components/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/:problemId" 
            element={
              <ProtectedRoute>
                <InterviewProblemPage />
              </ProtectedRoute>
            } 
          />
          {/* New routes for video interviews */}
          <Route 
            path="/video-interview/:problemId" 
            element={
              <ProtectedRoute>
                <VideoInterviewScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview/:interviewId/results" 
            element={
              <ProtectedRoute>
                <InterviewResultsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;