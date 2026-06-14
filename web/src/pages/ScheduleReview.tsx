import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Users, Calendar, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { messagesApi } from '../services/messages';
import { groupsApi } from '../services/groups';

type LocationState = {
  title: string;
  body: string;
  groupIds: string[];
  contactIds: string[];
};

function countSegments(body: string) {
  if (!body) return 1;
  return body.length <= 160 ? 1 : Math.ceil(body.length / 153);
}

/** Returns ISO string formatted for `<input type="datetime-local">`. */
function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ScheduleReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.title) return <Navigate to="/compose" replace />;

  const [mode, setMode] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState<string>(() => {
    const d = new Date(); d.setMinutes(d.getMinutes() + 30); return toLocalInputValue(d);
  });
  const [sending, setSending] = useState(false);

  // Unique recipient count (server dedupes by phone, but we compute client-side for the estimate card)
  const [uniqueRecipients, setUniqueRecipients] = useState<number>(state.contactIds.length);

  useEffect(() => {
    let alive = true;
    groupsApi.list().then((all) => {
      if (!alive) return;
      const memberPhones = new Set<string>();
      all.filter((g) => state.groupIds.includes(g.id)).forEach((g) => {
        (g.members ?? []).forEach((m) => memberPhones.add(m.contact.id));
      });
      state.contactIds.forEach((id) => memberPhones.add(id));
      setUniqueRecipients(memberPhones.size);
    }).catch(() => {});
    return () => { alive = false; };
  }, [state.groupIds, state.contactIds]);

  const segments = countSegments(state.body);
  const estCost  = segments * uniqueRecipients;

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const iso = mode === 'schedule' ? new Date(scheduledAt).toISOString() : null;
      const res = await messagesApi.create({
        title: state.title,
        body: state.body,
        groupIds: state.groupIds,
        contactIds: state.contactIds,
        scheduledAt: iso,
      });
      const verb = mode === 'now' ? 'Sent' : 'Scheduled';
      alert(`✓ ${verb}\n${res.cost} credit${res.cost === 1 ? '' : 's'} used`);
      navigate('/dashboard');
    } catch (e: any) {
      const msg = e?.message || 'Please try again.';
      alert(msg.toLowerCase().includes('insufficient credits') ? 'Insufficient credits.' : 'Send failed: ' + msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-ink"><ChevronLeft size={20} /></button>
        <h1 className="text-2xl font-bold">Schedule &amp; Review</h1>
      </div>
      <p className="text-sm text-muted mb-6">Confirm the details before sending.</p>

      {/* Recipients */}
      <Card className="mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Users size={18} className="text-primary" />
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Recipients</span>
        </div>
        <p className="text-sm">
          {state.groupIds.length > 0 && `${state.groupIds.length} group${state.groupIds.length === 1 ? '' : 's'}`}
          {state.groupIds.length > 0 && state.contactIds.length > 0 && ' + '}
          {state.contactIds.length > 0 && `${state.contactIds.length} contact${state.contactIds.length === 1 ? '' : 's'}`}
          {uniqueRecipients > 0 && ` · ${uniqueRecipients} recipient${uniqueRecipients === 1 ? '' : 's'} total`}
        </p>
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-primary mt-2">Edit</button>
      </Card>

      {/* Message */}
      <Card className="mb-3">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={18} className="text-primary" />
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Message</span>
        </div>
        <p className="font-semibold text-sm mb-1">{state.title}</p>
        <p className="text-sm text-ink whitespace-pre-wrap line-clamp-4">{state.body}</p>
        <p className="text-xs text-muted mt-2">{state.body.length} chars · {segments} segment{segments === 1 ? '' : 's'}</p>
        <button
          onClick={() => navigate('/compose', { state: { presetTitle: state.title, presetBody: state.body } })}
          className="text-sm font-semibold text-primary mt-2"
        >
          Edit
        </button>
      </Card>

      {/* Estimate */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar size={18} className="text-primary" />
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Estimated Cost</span>
        </div>
        <p className="text-sm">
          {segments} segment{segments === 1 ? '' : 's'} × {uniqueRecipients} recipient{uniqueRecipients === 1 ? '' : 's'} ·
          ~{estCost} credit{estCost === 1 ? '' : 's'}
        </p>
      </Card>

      {/* Send mode */}
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">When to send</h2>
      <div className="flex gap-2 mb-4 p-1 bg-bg rounded-lg border border-line w-fit">
        <button
          onClick={() => setMode('now')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            mode === 'now' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Send Now
        </button>
        <button
          onClick={() => setMode('schedule')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            mode === 'schedule' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Schedule
        </button>
      </div>

      {mode === 'schedule' && (
        <Card className="mb-6">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Date &amp; Time</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={toLocalInputValue(new Date())}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white"
            />
          </label>
          <p className="text-xs text-muted mt-2 flex items-start gap-1">
            <AlertCircle size={12} className="mt-0.5" />
            Times shown in your device timezone. Delivery may vary by carrier availability.
          </p>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSend} loading={sending}>
          {mode === 'now' ? 'Send Message' : 'Schedule Message'}
        </Button>
      </div>
    </div>
  );
}
