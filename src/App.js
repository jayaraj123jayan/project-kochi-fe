import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import TenantPage from './components/TenantPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
            <Route path="/tenant" element={<PrivateRoute><TenantPage /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminPrivateRoute = ({ children }) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
  const adminToken = localStorage.getItem('adminToken');
  return adminUser && adminToken ? children : <Navigate to="/admin/login" />;
};

export default App;
