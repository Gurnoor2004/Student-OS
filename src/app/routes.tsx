import { createBrowserRouter } from 'react-router';
import { Shell } from '@/components/layout/Shell';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TodayPage } from '@/pages/TodayPage';
import { TimetablePage } from '@/pages/TimetablePage';
import { AttendancePage } from '@/pages/AttendancePage';
import { AssignmentsPage } from '@/pages/AssignmentsPage';
import { ExamsPage } from '@/pages/ExamsPage';
import { TasksPage } from '@/pages/TasksPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { NotesPage } from '@/pages/NotesPage';
import { NoticesPage } from '@/pages/NoticesPage';
import { OpportunitiesPage } from '@/pages/OpportunitiesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <Shell />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'today', element: <TodayPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'timetable', element: <TimetablePage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'assignments', element: <AssignmentsPage /> },
      { path: 'exams', element: <ExamsPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'notices', element: <NoticesPage /> },
      { path: 'opportunities', element: <OpportunitiesPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
