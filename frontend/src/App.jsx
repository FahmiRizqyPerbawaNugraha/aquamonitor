import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import MonitoringPage from './pages/MonitoringPage';
import HistorisPage from './pages/HistorisPage';
import KalibrasiPage from './pages/KalibrasiPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDataPage from './pages/admin/AdminDataPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';
import AdminApiKeysPage from './pages/admin/AdminApiKeysPage';
import Spinner from './components/ui/Spinner';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="historis" element={<HistorisPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="kalibrasi" element={
          <ProtectedRoute roles={['admin', 'pengelola']}><KalibrasiPage /></ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="admin/users" element={
          <ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>
        } />
        <Route path="admin/data" element={
          <ProtectedRoute roles={['admin']}><AdminDataPage /></ProtectedRoute>
        } />
        <Route path="admin/logs" element={
          <ProtectedRoute roles={['admin']}><AdminLogsPage /></ProtectedRoute>
        } />
        <Route path="admin/api-keys" element={
          <ProtectedRoute roles={['admin']}><AdminApiKeysPage /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
