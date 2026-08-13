import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StudentDashboard } from './pages/StudentDashboard'
import { FacultyDashboard } from './pages/FacultyDashboard'
import { Login } from './pages/Login'
import { VirtualLab } from './pages/VirtualLab'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Analytics } from './pages/Analytics'
import { Submissions } from './pages/Submissions'
import { Schedule } from './pages/Schedule'
import { Timetable } from './pages/Timetable'
import { Announcements } from './pages/Announcements'
import { Assignments } from './pages/Assignments'
import { Helpdesk } from './pages/Helpdesk'
import { ManageLabs } from './pages/ManageLabs'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ManageFaculty } from './pages/admin/ManageFaculty'
import { ManageStudents } from './pages/admin/ManageStudents'
import { AdminManageLabs } from './pages/admin/AdminManageLabs'
import { ManageDepartments } from './pages/admin/ManageDepartments'
import { ManageSemesters } from './pages/admin/ManageSemesters'
import { ManageCourses } from './pages/admin/ManageCourses'
import { ManageExperiments } from './pages/admin/ManageExperiments'
import { AuthProvider, useAuth } from './context/AuthContext'

const AuthLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-canvas-bg">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'student' | 'faculty' | 'admin' }) => {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user data to load before making role-based decisions
  if (isAuthLoading || !user) {
    return <AuthLoadingSpinner />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Authenticated but wrong role — redirect to the correct dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Route wrapper to redirect based on user role when hitting root
const RootRedirect = () => {
  const { user, isAuthLoading } = useAuth();

  // Wait for user data before deciding which dashboard to show
  if (isAuthLoading || !user) {
    return <AuthLoadingSpinner />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
  return <StudentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <RootRedirect />
            </ProtectedRoute>
          } />
          
          <Route path="/lab/:experimentId" element={
            <ProtectedRoute allowedRole="student">
              <VirtualLab />
            </ProtectedRoute>
          } />

          <Route path="/faculty" element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/manage-labs" element={
            <ProtectedRoute allowedRole="faculty">
              <ManageLabs />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/faculty" element={
            <ProtectedRoute allowedRole="admin">
              <ManageFaculty />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRole="admin">
              <ManageStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/labs" element={
            <ProtectedRoute allowedRole="admin">
              <AdminManageLabs />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRole="admin">
              <ManageDepartments />
            </ProtectedRoute>
          } />
          <Route path="/admin/semesters" element={
            <ProtectedRoute allowedRole="admin">
              <ManageSemesters />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute allowedRole="admin">
              <ManageCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/experiments" element={
            <ProtectedRoute allowedRole="admin">
              <ManageExperiments />
            </ProtectedRoute>
          } />

          {/* Placeholder Routes */}
          <Route path="/assignments" element={<ProtectedRoute allowedRole="student"><Assignments /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRole="student"><Timetable /></ProtectedRoute>} />
          <Route path="/updates" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/helpdesk" element={<ProtectedRoute allowedRole="student"><Helpdesk /></ProtectedRoute>} />

          <Route path="/submissions" element={<ProtectedRoute allowedRole="faculty"><Submissions /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRole="faculty"><Analytics /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
