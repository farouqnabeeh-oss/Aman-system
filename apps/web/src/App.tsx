import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { FinancePage } from './features/finance/pages/FinancePage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { TasksPage } from './features/tasks/pages/TasksPage';
import { FilesPage } from './features/files/pages/FilesPage';
import { NotificationsPage } from './features/notifications/pages/NotificationsPage';
import { HrPage } from './features/hr/pages/HrPage';
import { PayrollPage } from './features/payroll/pages/PayrollPage';
import { AuditLogPage } from './features/audit-log/pages/AuditLogPage';
import { ProfilePage } from './features/auth/pages/ProfilePage';

// Simple Auth guard
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s: any) => s.isAuthenticated);
  if (isAuth === true) return <>{children}</>;
  return <Navigate to="/login" replace />;
}

// Simple Guest guard
function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s: any) => s.isAuthenticated);
  if (isAuth === true) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
        
        <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="finance/*" element={<FinancePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="hr" element={<HrPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
