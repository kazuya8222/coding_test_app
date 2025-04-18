import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Home } from './components/Home';
import { InterviewSession } from './components/interview/InterviewSession';
import { ProblemList } from './components/interview/ProblemList';
import { InterviewProblemPage } from './components/interview/InterviewProblem';

const App: React.FC = () => {
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
          <Route path="/interview/:problemId" element={<InterviewProblemPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 