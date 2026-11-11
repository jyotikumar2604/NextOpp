import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages — Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OnboardingPage from './pages/auth/OnboardingPage';

// Pages — Student
import DashboardPage from './pages/student/DashboardPage';
import ExplorePage from './pages/student/ExplorePage';
import OpportunityDetailPage from './pages/student/OpportunityDetailPage';
import SavedPage from './pages/student/SavedPage';
import TrackerPage from './pages/student/TrackerPage';
import ProfilePage from './pages/student/ProfilePage';
import NotificationsPage from './pages/student/NotificationsPage';
import SettingsPage from './pages/student/SettingsPage';

// Pages — Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOpportunitiesPage from './pages/admin/AdminOpportunitiesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';
import AdminOpportunityFormPage from './pages/admin/AdminOpportunityFormPage';
import AdminIngestionPage from './pages/admin/AdminIngestionPage';

// Guards
function RequireAuth({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Redirect un-onboarded users to onboarding (except when already there)
  if (user && !user.isOnboarded && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-charcoal-200 border-t-rust-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-charcoal-500 text-sm font-medium">Loading NextOpp…</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
      <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Onboarding — auth required but no onboarding-gate */}
      <Route path="/onboarding" element={
        <RequireAuthNoGate><OnboardingPage /></RequireAuthNoGate>
      } />

      {/* Opportunities (public access with optional clean SEO slug) */}
      <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
      <Route path="/opportunities/:id/:slug" element={<OpportunityDetailPage />} />

      {/* Student app */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Admin */}
      <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/opportunities" element={<AdminOpportunitiesPage />} />
        <Route path="/admin/opportunities/new" element={<AdminOpportunityFormPage />} />
        <Route path="/admin/opportunities/:id/edit" element={<AdminOpportunityFormPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/logs" element={<AdminLogsPage />} />
        <Route path="/admin/ingest" element={<AdminIngestionPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Auth guard that does NOT redirect to onboarding (used for the onboarding route itself)
function RequireAuthNoGate({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A1A',
              color: '#FAF7F0',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#FAF7F0' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FAF7F0' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
