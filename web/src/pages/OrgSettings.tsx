import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { orgsApi } from '../services/orgs';
import { useAuth } from '../state/auth';

export default function OrgSettings() {
  const navigate = useNavigate();
  const { activeMembership, refreshMe } = useAuth();
  const isAdmin = activeMembership?.role === 'admin';
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orgsApi.getOrg().then((o) => { setName(o.name); setCode(o.code); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!isAdmin) { alert('Only admins can edit org settings.'); return; }
    if (!name.trim()) { alert('Organisation name required.'); return; }
    setSaving(true);
    try {
      await orgsApi.updateOrg({ name: name.trim() });
      await refreshMe();
      alert('Organisation updated.');
      navigate('/settings');
    } catch (e: any) {
      const msg = e?.message?.toLowerCase().includes('forbidden') || e?.message?.includes('403')
        ? 'Only admins can update organisation settings.'
        : 'Save failed: ' + (e?.message || 'Try again.');
      alert(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Organisation Settings</h1>
      <p className="text-sm text-muted mb-6">{isAdmin ? 'Edit your organisation details.' : 'You need admin access to edit these settings.'}</p>

      <Card className="space-y-4">
        <Input label="Organisation Name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdmin} placeholder="e.g. Sunrise Halls" />
        <Input label="Building Code" value={code} disabled />
        <p className="text-xs text-muted">Building code is permanent and shared with members who want to join.</p>
        {isAdmin && (
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
