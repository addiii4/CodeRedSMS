import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { usersApi } from '../services/users';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirm) { alert('All fields required.'); return; }
    if (newPassword.length < 6) { alert('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirm) { alert('Passwords do not match.'); return; }
    setSaving(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      alert('Password changed.');
      navigate('/settings');
    } catch (e: any) { alert('Change failed: ' + (e?.message || 'Try again.')); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Change Password</h1>
      <p className="text-sm text-muted mb-6">Enter your current password and choose a new one.</p>

      <Card className="space-y-4">
        <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
        <Input label="Confirm New Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>Update Password</Button>
        </div>
      </Card>
    </div>
  );
}
