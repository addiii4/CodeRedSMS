import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { useAuth } from '../state/auth';

const SUPPORT_EMAIL = 'adityacheema4@gmail.com';

/**
 * EmailJS configuration — fill these in with your own values from emailjs.com:
 *
 *   1. Sign up at emailjs.com (free tier = 200 emails/month)
 *   2. Add an email service (Gmail/Outlook) — note the SERVICE_ID
 *   3. Create an email template with these variables:
 *        {{from_name}}, {{from_email}}, {{org_name}}, {{subject}}, {{message}}
 *      Note the TEMPLATE_ID.
 *   4. Account → API Keys → copy your Public Key.
 *   5. Paste below, then redeploy.
 */
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';

export default function ContactUs() {
  const navigate = useNavigate();
  const { user, activeMembership } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');
    if (!subject.trim() || !message.trim()) { setError('Subject and message are required.'); return; }

    // Fallback to mailto if EmailJS isn't configured yet — never blocks the user.
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.location.href = url;
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: user?.displayName ?? 'Unknown',
          from_email: user?.email ?? 'unknown',
          org_name: activeMembership?.org.name ?? 'No org',
          subject: subject.trim(),
          message: message.trim(),
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setSent(true);
    } catch (e: any) {
      setError(e?.text || e?.message || 'Failed to send. Try again or email us directly.');
    } finally { setSending(false); }
  };

  if (sent) {
    return (
      <div className="max-w-xl">
        <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
          <ChevronLeft size={16} /> Back to Settings
        </button>
        <Card className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 grid place-items-center mx-auto mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-1">Message Sent</h2>
          <p className="text-sm text-muted mb-4">We'll reply to {user?.email} within 1 business day.</p>
          <Button onClick={() => navigate('/settings')}>Done</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Contact Us</h1>
      <p className="text-sm text-muted mb-6">Question, bug, or feature request? Tell us about it.</p>

      <Card className="space-y-4">
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Can't send messages" />
        <label className="block">
          <span className="block text-sm font-medium mb-1">Message</span>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-y"
            placeholder="Tell us what's happening…"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">From: {user?.email}</span>
          <Button onClick={handleSend} loading={sending}>
            <span className="inline-flex items-center gap-2"><Mail size={14} /> Send Message</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
