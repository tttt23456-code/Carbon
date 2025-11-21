import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ActivityRecords } from './pages/ActivityRecords';
import { Calculations } from './pages/Calculations';
import { Reports } from './pages/Reports';
import { Organizations } from './pages/Organizations';
import { EmissionFactors } from './pages/EmissionFactors';
import { DashboardLayout } from './components/DashboardLayout';
import { useAuthStore } from './hooks/useAuthStore';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/activity-records" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ActivityRecords />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/calculations" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Calculations />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/reports" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/organizations" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Organizations />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/emission-factors" element={
          <ProtectedRoute>
            <DashboardLayout>
              <EmissionFactors />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;