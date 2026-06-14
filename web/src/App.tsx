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
import Templates from './pages/Templates';
import Logs from './pages/Logs';
import LogDetail from './pages/LogDetail';
import Contacts from './pages/Contacts';
import ContactImport from './pages/ContactImport';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import OrgSettings from './pages/OrgSettings';
import OrgMembers from './pages/OrgMembers';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import BuyCredits from './pages/BuyCredits';
import PurchaseHistory from './pages/PurchaseHistory';

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
        <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
        <Route path="/logs/:id" element={<PrivateRoute><LogDetail /></PrivateRoute>} />
        <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
        <Route path="/contacts/import" element={<PrivateRoute><ContactImport /></PrivateRoute>} />

        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/settings/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        <Route path="/settings/org" element={<PrivateRoute><OrgSettings /></PrivateRoute>} />
        <Route path="/settings/members" element={<PrivateRoute><OrgMembers /></PrivateRoute>} />

        <Route path="/help" element={<PrivateRoute><HelpCenter /></PrivateRoute>} />
        <Route path="/contact-us" element={<PrivateRoute><ContactUs /></PrivateRoute>} />

        <Route path="/billing" element={<PrivateRoute><BuyCredits /></PrivateRoute>} />
        <Route path="/billing/history" element={<PrivateRoute><PurchaseHistory /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthBoundary>
  );
}
