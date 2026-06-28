import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Users, FileText, BarChart3, CreditCard,
  CheckCircle2, XCircle, Clock, Activity, HelpCircle,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PasswordGate from '../components/PasswordGate';
import { paymentsApi } from '../services/payments';
import { messagesApi, MessageListItem } from '../services/messages';
import { useAuth } from '../state/auth';

type StatusIcon = { Icon: typeof CheckCircle2; color: string };

function statusIcon(status: string): StatusIcon {
  switch (status) {
    case 'sent':       return { Icon: CheckCircle2,   color: 'text-ink' };
    case 'failed':     return { Icon: XCircle,        color: 'text-red-600' };
    case 'queued':
    case 'scheduled': return { Icon: Clock,           color: 'text-amber-600' };
    case 'sending':    return { Icon: Activity,       color: 'text-blue-600' };
    default:           return { Icon: Clock,          color: 'text-muted' };
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

const QUICK_ACTIONS: { label: string; to: string; Icon: typeof Send; tag: string }[] = [
  { label: 'Contacts',  to: '/contacts',  Icon: Users,      tag: 'Manage' },
  { label: 'Templates', to: '/templates', Icon: FileText,   tag: 'Reuse' },
  { label: 'Logs',      to: '/logs',      Icon: BarChart3,  tag: 'View' },
  { label: 'Support',   to: '/help',      Icon: HelpCircle, tag: 'Help' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeMembership } = useAuth();
  const isAdmin = activeMembership?.role === 'admin';

  const [credits, setCredits] = useState<number | null>(null);
  const [recent, setRecent] = useState<MessageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);

  /** Buy Credits = admin-only. Non-admins see a polite block. */
  const handleBilling = () => {
    if (!isAdmin) {
      alert('Only org admins can buy credits. Please ask your admin to top up.');
      return;
    }
    setGateOpen(true);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      paymentsApi.balance().catch(() => ({ credits: 0 })),
      messagesApi.list().catch(() => ({ items: [] })),
    ]).then(([balance, list]) => {
      if (!active) return;
      setCredits(balance.credits);
      setRecent(list.items.slice(0, 5));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleBilling}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow"
        >
          <CreditCard size={16} />
          {credits === null ? '…' : `${credits.toLocaleString()} Credits`}
        </button>
      </div>

      {/* Hero CTA — primary action: send a new message */}
      <button
        onClick={() => navigate('/compose')}
        className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl p-6 mb-6 flex items-center gap-4 shadow-sm transition"
      >
        <div className="w-12 h-12 rounded-xl bg-white/15 grid place-items-center">
          <Send size={24} />
        </div>
        <div className="text-left flex-1">
          <div className="text-lg font-semibold">Send a New Message</div>
          <div className="text-sm opacity-80">Choose a template or write a custom message</div>
        </div>
        <div className="hidden md:block text-sm font-semibold opacity-80">Compose →</div>
      </button>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {QUICK_ACTIONS.map((a) => (
          <Card key={a.to} onClick={() => navigate(a.to)} className="flex flex-col items-start gap-2 hover:border-primary">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <a.Icon size={20} />
            </div>
            <div className="font-semibold text-sm">{a.label}</div>
            <div className="text-xs text-muted">{a.tag}</div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Recent Activity</h2>
        <button onClick={() => navigate('/logs')} className="text-sm text-primary font-semibold">View all →</button>
      </div>

      {loading ? (
        <Card className="text-center text-muted text-sm">Loading…</Card>
      ) : recent.length === 0 ? (
        <Card className="text-center text-muted text-sm">No recent activity yet</Card>
      ) : (
        <div className="space-y-2">
          {recent.map((item) => {
            const { Icon, color } = statusIcon(item.status);
            return (
              <Card
                key={item.id}
                onClick={() => navigate(`/logs/${item.id}`)}
                className="flex items-center gap-4 py-3"
              >
                <Icon size={22} className={color} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{item.title}</div>
                  <div className="text-xs text-muted">{formatDate(item.createdAt)}</div>
                </div>
                <div className="text-xs uppercase tracking-wider text-muted">{item.status}</div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <Button variant="secondary" onClick={() => navigate('/logs')}>View All Logs</Button>
      </div>

      <PasswordGate
        open={gateOpen}
        title="Billing Access"
        subtitle="Confirm your password to manage credits"
        onSuccess={() => { setGateOpen(false); navigate('/billing'); }}
        onCancel={() => setGateOpen(false)}
      />
    </div>
  );
}
