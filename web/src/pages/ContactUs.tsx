import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

const SUPPORT_EMAIL = 'adityacheema4@gmail.com';

export default function ContactUs() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) { alert('Subject and message are required.'); return; }
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Contact Us</h1>
      <p className="text-sm text-muted mb-6">Have a question, found a bug, or need help? Send us a message.</p>

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
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Sends to: {SUPPORT_EMAIL}</span>
          <Button onClick={handleSend}>
            <span className="inline-flex items-center gap-2"><Mail size={14} /> Send Email</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
