import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react';
import Card from '../components/Card';

const FAQS = [
  { q: 'How do credits work?', a: 'Each SMS uses 1 credit per 160-character segment per recipient. Longer messages use multiple credits per recipient.' },
  { q: 'What is a group?', a: 'A named collection of contacts. Useful for sending the same message to staff, residents, or any other set of people at once.' },
  { q: 'Can I schedule messages for later?', a: 'Yes. In the Compose flow, after choosing recipients, pick "Schedule" and set a date and time. The system sends automatically.' },
  { q: 'How do I import contacts from a spreadsheet?', a: 'Go to Contacts → Import CSV. The file needs a fullName column and a phoneE164 column (Australian-format numbers are auto-prefixed with +61).' },
  { q: 'Will messages always deliver instantly?', a: 'SMS delivery depends on carriers. Most messages arrive within seconds, but during peak periods or to certain networks it can take a few minutes.' },
  { q: 'What if a message fails to send?', a: 'Failed recipients are refunded credits automatically. You can see per-recipient status by opening any message in Logs.' },
  { q: 'How do I buy more credits?', a: 'Settings → Buy Credits. Pick a plan or enter a custom amount, pay via Stripe, and credits land in your account in seconds.' },
  { q: 'Who can manage my organisation?', a: 'Admins can edit org settings, manage members, change member roles, and approve new members. Editors can send messages; viewers can only view logs.' },
  { q: 'What happens to a pending account?', a: 'If you joined via building code, an org admin needs to approve you. If you started a new org, the Code Red team approves it (usually within 1 business day).' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left p-4 border-b border-line last:border-b-0 hover:bg-bg transition">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-sm">{q}</span>
        {open ? <ChevronUp size={16} className="text-muted shrink-0" /> : <ChevronDown size={16} className="text-muted shrink-0" />}
      </div>
      {open && <p className="text-sm text-muted mt-2">{a}</p>}
    </button>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Help Center</h1>
      <p className="text-sm text-muted mb-6">Common questions about Code Red SMS.</p>

      <Card className="p-0">
        {FAQS.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
      </Card>
    </div>
  );
}
