import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../state/auth';

export default function PendingApproval() {
  const { user, memberships, refreshMe, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshMe(); } finally { setRefreshing(false); }
  };

  // Find what they're waiting on
  const pendingOrgRequest = memberships.find((m) => m.org.status === 'pending');
  const pendingMembership = memberships.find((m) => m.status === 'pending' && m.org.status === 'active');

  return (
    <div className="min-h-screen grid place-items-center bg-bg px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-line shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Code Red SMS" className="w-10 h-10 object-contain" />
          <h1 className="text-lg font-semibold">Code Red SMS</h1>
        </div>

        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 grid place-items-center mb-4">
          <Clock size={28} />
        </div>

        <h2 className="text-xl font-semibold mb-2">Pending Approval</h2>
        <p className="text-sm text-muted mb-5">
          Hi {user?.displayName}, your account is awaiting approval before you can send messages.
        </p>

        {pendingOrgRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm text-amber-900">
            <p className="font-semibold mb-1">New organisation: {pendingOrgRequest.org.name}</p>
            <p>The Code Red team is reviewing your request. You'll be notified by email once approved (usually within 1 business day).</p>
          </div>
        )}

        {pendingMembership && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm text-amber-900">
            <p className="font-semibold mb-1">Joining: {pendingMembership.org.name}</p>
            <p>Your access request has been sent to the organisation's admin. They need to approve you before you can send messages.</p>
          </div>
        )}

        {memberships.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-900">
            <p className="font-semibold mb-1">No organisation linked</p>
            <p>Your account isn't linked to any organisation. Contact support.</p>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Button variant="secondary" onClick={handleRefresh} loading={refreshing} className="flex-1">
            <span className="inline-flex items-center gap-2"><RefreshCw size={14} /> Refresh status</span>
          </Button>
          <Button variant="ghost" onClick={logout}>
            <span className="inline-flex items-center gap-2"><LogOut size={14} /> Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
