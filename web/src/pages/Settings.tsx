import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Building2, Users, CreditCard, History,
  HelpCircle, Mail, LogOut, ChevronRight,
} from 'lucide-react';
import Card from '../components/Card';
import PasswordGate from '../components/PasswordGate';
import { useAuth } from '../state/auth';
import { usePendingMembers } from '../hooks/usePendingMembers';
import { paymentsApi } from '../services/payments';

type Row = { label: string; sub?: string; Icon: typeof User; to?: string; onClick?: () => void; danger?: boolean; badge?: number };

export default function Settings() {
  const navigate = useNavigate();
  const { user, activeMembership, logout } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [gateTarget, setGateTarget] = useState<string | null>(null);

  useEffect(() => {
    paymentsApi.balance().then((b) => setCredits(b.credits)).catch(() => {});
  }, []);

  const isAdmin = activeMembership?.role === 'admin';
  const pendingCount = usePendingMembers();

  /** Billing rows: admin-only. Non-admins get a polite block; admins go through the password gate. */
  const handleBilling = (target: string) => () => {
    if (!isAdmin) {
      alert('Only org admins can manage billing. Please ask your admin.');
      return;
    }
    setGateTarget(target);
  };

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'Organisation',
      rows: [
        { label: 'Org Settings', sub: 'Name, building code', Icon: Building2, to: '/settings/org' },
        {
          label: 'Members',
          sub: pendingCount > 0 ? `${pendingCount} pending approval` : (isAdmin ? 'Manage who has access' : 'See who has access'),
          Icon: Users, to: '/settings/members',
          badge: pendingCount,
        },
      ],
    },
    {
      title: 'Account',
      rows: [
        { label: 'Profile', sub: user?.displayName, Icon: User, to: '/settings/profile' },
        { label: 'Change Password', Icon: Lock, to: '/settings/change-password' },
      ],
    },
    {
      title: 'Billing',
      rows: [
        { label: 'Buy Credits',      sub: credits === null ? '' : `${credits} credits remaining`, Icon: CreditCard, onClick: handleBilling('/billing') },
        { label: 'Purchase History', Icon: History, onClick: handleBilling('/billing/history') },
      ],
    },
    {
      title: 'Support',
      rows: [
        { label: 'Help Center', Icon: HelpCircle, to: '/help' },
        { label: 'Contact Us', Icon: Mail, to: '/contact-us' },
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted mb-6">{user?.email} · {activeMembership?.org.name}</p>

      {sections.map((s) => (
        <div key={s.title} className="mb-6">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{s.title}</h2>
          <Card className="p-0 divide-y divide-line">
            {s.rows.map((r) => (
              <button
                key={r.label}
                onClick={() => r.to ? navigate(r.to) : r.onClick?.()}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-bg text-left transition first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <r.Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.label}</div>
                  {r.sub && <div className="text-xs text-muted truncate">{r.sub}</div>}
                </div>
                {r.badge && r.badge > 0 ? (
                  <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
                    {r.badge}
                  </span>
                ) : null}
                <ChevronRight size={16} className="text-muted shrink-0" />
              </button>
            ))}
          </Card>
        </div>
      ))}

      <div className="mt-8">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-line bg-white text-red-600 hover:bg-red-50 transition text-sm font-semibold"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <PasswordGate
        open={!!gateTarget}
        title="Billing Access"
        subtitle="Confirm your password to continue"
        onSuccess={() => { const t = gateTarget!; setGateTarget(null); navigate(t); }}
        onCancel={() => setGateTarget(null)}
      />
    </div>
  );
}
