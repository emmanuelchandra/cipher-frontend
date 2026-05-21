import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CursorCharacter from './components/CursorCharacter';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FaceRegister from './pages/FaceRegister';
import Attendance from './pages/Attendance';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Shifts from './pages/Shifts';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Settings from './pages/Settings';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="py-6">{children}</main>
  </div>
);

const App = () => (
  <AuthProvider>
    <CursorCharacter />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['admin', 'hr', 'employee']}>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/face-register" element={
          <ProtectedRoute roles={['admin', 'hr', 'employee']}>
            <Layout><FaceRegister /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute roles={['admin', 'hr', 'employee']}>
            <Layout><Attendance /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/employees" element={
          <ProtectedRoute roles={['admin', 'hr']}>
            <Layout><Employees /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/departments" element={
          <ProtectedRoute roles={['admin']}>
            <Layout><Departments /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/shifts" element={
          <ProtectedRoute roles={['admin']}>
            <Layout><Shifts /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute roles={['admin', 'hr', 'employee']}>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/:id" element={
          <ProtectedRoute roles={['admin', 'hr', 'employee']}>
            <Layout><ReportDetail /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute roles={['admin', 'hr']}>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
