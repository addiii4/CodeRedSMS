import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './state/auth';
import Layout from './components/Layout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PendingApproval from './pages/PendingApproval';
import Compose from './pages/Compose';
import SelectRecipients from './pages/SelectRecipients';
import ScheduleReview from './pages/ScheduleReview';

function AuthBoundary({ children }: { children: ReactNode }) {
  const { ready } = useAuth();
  if (!ready) return <div className="h-screen grid place-items-center text-muted">Loading…</div>;
  return <>{children}</>;
}

/** Logged-in but waiting for approval — show pending screen, hide all app. */
function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, activeMembership } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!activeMembership) return <PendingApproval />;
  return <Layout>{children}</Layout>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, activeMembership } = useAuth();
  if (user && activeMembership) return <Navigate to="/dashboard" replace />;
  if (user && !activeMembership) return <PendingApproval />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthBoundary>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/compose" element={<PrivateRoute><Compose /></PrivateRoute>} />
        <Route path="/compose/recipients" element={<PrivateRoute><SelectRecipients /></PrivateRoute>} />
        <Route path="/compose/review" element={<PrivateRoute><ScheduleReview /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthBoundary>
  );
}
