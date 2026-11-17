import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';

import DashboardLayout from './components/Layout/DashboardLayout';
import PrivateRoute from './components/common/PrivateRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import LabDirectory from './pages/student/LabDirectory';
import LabDetail from './pages/student/LabDetail';
import BookingForm from './pages/student/BookingForm';
import MyBookings from './pages/student/MyBookings';
import MyPasses from './pages/student/MyPasses';
import EquipmentBrowser from './pages/student/EquipmentBrowser';
import ProjectList from './pages/student/ProjectList';
import ProjectForm from './pages/student/ProjectForm';
import ProjectDetail from './pages/student/ProjectDetail';
import TeamFinder from './pages/student/TeamFinder';
import MentorshipPage from './pages/student/MentorshipPage';
import LearningHub from './pages/student/LearningHub';
import ShowcasePage from './pages/student/ShowcasePage';
import ProfilePage from './pages/student/ProfilePage';
import NotificationsPage from './pages/student/NotificationsPage';
import WaitingListPage from './pages/student/WaitingListPage';
import AiAssistantPage from './pages/student/AiAssistantPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import BookingApprovals from './pages/faculty/BookingApprovals';
import ExperimentManager from './pages/faculty/ExperimentManager';
import MaterialsManager from './pages/faculty/MaterialsManager';
import FacultyMentorship from './pages/faculty/FacultyMentorship';
import AnnouncementManager from './pages/faculty/AnnouncementManager';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianEquipment from './pages/technician/TechnicianEquipment';
import IssueManager from './pages/technician/IssueManager';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManager from './pages/admin/DepartmentManager';
import LabManager from './pages/admin/LabManager';
import EquipmentAdmin from './pages/admin/EquipmentAdmin';
import BookingManager from './pages/admin/BookingManager';
import PolicyManager from './pages/admin/PolicyManager';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import AuditLogs from './pages/admin/AuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '16px',
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                  },
                }}
              />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Student Routes */}
                <Route element={<PrivateRoute allowedRoles={['student', 'faculty', 'technician', 'admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/labs" element={<LabDirectory />} />
                    <Route path="/labs/:id" element={<LabDetail />} />
                    <Route path="/bookings" element={<MyBookings />} />
                    <Route path="/bookings/new/:labId" element={<BookingForm />} />
                    <Route path="/my-passes" element={<MyPasses />} />
                    <Route path="/equipment" element={<EquipmentBrowser />} />
                    <Route path="/projects" element={<ProjectList />} />
                    <Route path="/projects/new" element={<ProjectForm />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/teams" element={<TeamFinder />} />
                    <Route path="/mentorship" element={<MentorshipPage />} />
                    <Route path="/learning" element={<LearningHub />} />
                    <Route path="/showcase" element={<ShowcasePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/waiting-list" element={<WaitingListPage />} />
                    <Route path="/ai-assistant" element={<AiAssistantPage />} />
                  </Route>
                </Route>

                {/* Faculty Routes */}
                <Route element={<PrivateRoute allowedRoles={['faculty', 'admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                    <Route path="/faculty/bookings" element={<BookingApprovals />} />
                    <Route path="/faculty/experiments" element={<ExperimentManager />} />
                    <Route path="/faculty/materials" element={<MaterialsManager />} />
                    <Route path="/faculty/mentorship" element={<FacultyMentorship />} />
                    <Route path="/faculty/announcements" element={<AnnouncementManager />} />
                  </Route>
                </Route>

                {/* Technician Routes */}
                <Route element={<PrivateRoute allowedRoles={['technician', 'admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
                    <Route path="/technician/equipment" element={<TechnicianEquipment />} />
                    <Route path="/technician/issues" element={<IssueManager />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/departments" element={<DepartmentManager />} />
                    <Route path="/admin/labs" element={<LabManager />} />
                    <Route path="/admin/equipment" element={<EquipmentAdmin />} />
                    <Route path="/admin/bookings" element={<BookingManager />} />
                    <Route path="/admin/policies" element={<PolicyManager />} />
                    <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/admin/audit-logs" element={<AuditLogs />} />
                  </Route>
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
