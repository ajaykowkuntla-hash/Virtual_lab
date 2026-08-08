import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StudentDashboard } from './pages/StudentDashboard'
import { FacultyDashboard } from './pages/FacultyDashboard'
import { Login } from './pages/Login'
import { VirtualLab } from './pages/VirtualLab'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Analytics } from './pages/Analytics'
import { Submissions } from './pages/Submissions'
import { Schedule } from './pages/Schedule'
import { Timetable } from './pages/Timetable'
import { Announcements } from './pages/Announcements'
import { Updates } from './pages/Updates'
import { Assignments } from './pages/Assignments'
import { Helpdesk } from './pages/Helpdesk'
import { ManageLabs } from './pages/ManageLabs'
import { AuthProvider, useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'student' | 'faculty' }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // If authenticated but wrong role, redirect to appropriate dashboard
    return <Navigate to={user?.role === 'faculty' ? '/faculty' : '/'} replace />;
  }

  return <>{children}</>;
};

// Route wrapper to redirect based on user role when hitting root
const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'faculty') {
    return <Navigate to="/faculty" replace />;
  }
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

          {/* Placeholder Routes */}
          <Route path="/assignments" element={<ProtectedRoute allowedRole="student"><Assignments /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRole="student"><Timetable /></ProtectedRoute>} />
          <Route path="/updates" element={<ProtectedRoute allowedRole="student"><Updates /></ProtectedRoute>} />
          <Route path="/helpdesk" element={<ProtectedRoute allowedRole="student"><Helpdesk /></ProtectedRoute>} />

          <Route path="/submissions" element={<ProtectedRoute allowedRole="faculty"><Submissions /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRole="faculty"><Analytics /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute allowedRole="faculty"><Schedule /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute allowedRole="faculty"><Announcements /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
