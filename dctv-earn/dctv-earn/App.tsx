import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { TaskDetails } from './pages/TaskDetails';
import { MySubmissions } from './pages/worker/MySubmissions';
import { Wallet } from './pages/Wallet';
import { Referrals } from './pages/Referrals';
import { Profile } from './pages/Profile';
import { Employer } from './pages/Employer';
import { TaskReview } from './pages/employer/TaskReview';
import { Admin } from './pages/Admin';
import { Withdrawals } from './pages/admin/Withdrawals';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Worker Routes */}
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetails />} />
              <Route path="/worker/submissions" element={<MySubmissions />} />
              <Route path="/referrals" element={<Referrals />} />
              
              {/* Shared Routes */}
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Employer Routes */}
              <Route path="/employer" element={<Employer />} />
              <Route path="/employer/tasks/:id/review" element={<TaskReview />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/withdrawals" element={<Withdrawals />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;