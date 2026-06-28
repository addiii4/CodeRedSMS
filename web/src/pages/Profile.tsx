import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { usersApi } from '../services/users';
import { useAuth } from '../state/auth';

export default function Profile() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersApi.getMe().then((u) => { setDisplayName(u.displayName); setEmail(u.email); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!displayName.trim()) { alert('Display name required.'); return; }
    setSaving(true);
    try {
      await usersApi.updateMe({ displayName: displayName.trim() });
      await refreshMe();
      alert('Profile updated.');
      navigate('/settings');
    } catch (e: any) { alert('Save failed: ' + (e?.message || 'Try again.')); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Profile</h1>
      <p className="text-sm text-muted mb-6">Edit your name and email.</p>

      <Card className="space-y-4">
        <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        <Input label="Email" value={email} disabled />
        <p className="text-xs text-muted">Email cannot be changed here. Contact support if needed.</p>
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
