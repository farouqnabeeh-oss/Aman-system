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
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated === true) {
    return <Navigate to={user?.role === 'EMPLOYEE' ? "/tasks" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const user = useAuthStore(s => s.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
        
        <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to={user?.role === 'EMPLOYEE' ? "/tasks" : "/dashboard"} replace />} />
          <Route path="dashboard" element={user?.role === 'EMPLOYEE' ? <Navigate to="/tasks" replace /> : <DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="finance/*" element={user?.role === 'EMPLOYEE' ? <Navigate to="/tasks" replace /> : <FinancePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="hr" element={<HrPage />} />
          <Route path="payroll" element={user?.role === 'EMPLOYEE' ? <Navigate to="/tasks" replace /> : <PayrollPage />} />
          <Route path="audit-logs" element={user?.role === 'EMPLOYEE' ? <Navigate to="/tasks" replace /> : <AuditLogPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
