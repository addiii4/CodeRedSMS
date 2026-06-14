import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import Card from '../components/Card';
import { messagesApi, MessageDetail } from '../services/messages';

function statusBadge(status: string) {
  switch (status) {
    case 'sent':    return { Icon: CheckCircle2, color: 'text-ink', label: 'Sent' };
    case 'failed':  return { Icon: XCircle, color: 'text-red-600', label: 'Failed' };
    case 'queued':  return { Icon: Clock, color: 'text-amber-600', label: 'Scheduled' };
    case 'sending': return { Icon: Activity, color: 'text-blue-600', label: 'Sending' };
    default:        return { Icon: Clock, color: 'text-muted', label: status };
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function LogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [msg, setMsg] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    messagesApi.get(id)
      .then(setMsg)
      .catch((e) => setError(e?.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-muted text-sm">Loading…</div>;
  if (error || !msg) return (
    <div>
      <button onClick={() => navigate('/logs')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to logs
      </button>
      <Card className="text-center text-red-600">{error || 'Not found'}</Card>
    </div>
  );

  const { Icon, color, label } = statusBadge(msg.status);

  return (
    <div>
      <button onClick={() => navigate('/logs')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to logs
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Icon size={28} className={color} />
        <div>
          <h1 className="text-2xl font-bold">{msg.title}</h1>
          <p className="text-sm text-muted">{label} · {formatDate(msg.createdAt)}</p>
        </div>
      </div>

      {msg.scheduledAt && (
        <Card className="mb-4 bg-amber-50 border-amber-200">
          <p className="text-sm">Scheduled for <b>{formatDate(msg.scheduledAt)}</b></p>
        </Card>
      )}

      {/* Message body */}
      <Card className="mb-4">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Message</div>
        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
      </Card>

      {/* Delivery breakdown */}
      <Card>
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Delivery · {msg.recipients} recipient{msg.recipients === 1 ? '' : 's'}
        </div>
        {Object.keys(msg.breakdown).length === 0 ? (
          <p className="text-sm text-muted">No delivery info yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(msg.breakdown).map(([k, v]) => (
              <div key={k} className="bg-bg rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-xs text-muted uppercase tracking-wider">{k}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
