import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Activity, Search } from 'lucide-react';
import Card from '../components/Card';
import { messagesApi, MessageListItem } from '../services/messages';

function statusIcon(status: string) {
  switch (status) {
    case 'sent':       return { Icon: CheckCircle2, color: 'text-ink' };
    case 'failed':     return { Icon: XCircle, color: 'text-red-600' };
    case 'queued':
    case 'scheduled': return { Icon: Clock, color: 'text-amber-600' };
    case 'sending':    return { Icon: Activity, color: 'text-blue-600' };
    default:           return { Icon: Clock, color: 'text-muted' };
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

export default function Logs() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MessageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    messagesApi.list()
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Message Logs</h1>
      <p className="text-sm text-muted mb-6">Every message sent or scheduled, newest first.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-sm bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-line rounded-lg text-sm bg-white"
        >
          <option value="all">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued / Scheduled</option>
          <option value="sending">Sending</option>
        </select>
      </div>

      {loading ? (
        <Card className="text-center text-muted text-sm">Loading…</Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center text-muted text-sm py-10">
          {items.length === 0 ? 'No messages yet.' : 'No matches for current filters.'}
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => {
            const { Icon, color } = statusIcon(m.status);
            return (
              <Card key={m.id} onClick={() => navigate(`/logs/${m.id}`)} className="flex items-center gap-4 py-3">
                <Icon size={22} className={color} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{m.title}</div>
                  <div className="text-xs text-muted">
                    {formatDate(m.createdAt)}
                    {m.scheduledAt && ` · Scheduled for ${formatDate(m.scheduledAt)}`}
                  </div>
                </div>
                <div className="text-xs uppercase tracking-wider text-muted">{m.status}</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
