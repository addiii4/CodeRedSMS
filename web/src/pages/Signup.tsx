import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../state/auth';

type Mode = 'join' | 'create';

export default function Signup() {
  const navigate = useNavigate();
  const { register, ready } = useAuth();

  const [mode, setMode] = useState<Mode>('join');
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [buildingCode, setBuildingCode] = useState('');
  const [orgName, setOrgName]   = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!fullName || !email || !password || !confirm || !buildingCode) {
      setError('Please fill all fields.'); return;
    }
    if (mode === 'create' && !orgName.trim()) { setError('Organisation name required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      if (mode === 'create') {
        await register({
          mode: 'create',
          email: email.trim().toLowerCase(),
          password,
          displayName: fullName.trim(),
          buildingCode: buildingCode.trim().toUpperCase(),
          orgName: orgName.trim(),
        });
      } else {
        await register({
          mode: 'join',
          email: email.trim().toLowerCase(),
          password,
          displayName: fullName.trim(),
          buildingCode: buildingCode.trim().toUpperCase(),
        });
      }
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Sign up failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-bg px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-line shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Code Red SMS" className="w-10 h-10 object-contain" />
          <h1 className="text-lg font-semibold">Code Red SMS</h1>
        </div>

        <h2 className="text-xl font-semibold mb-1">Create Account</h2>
        <p className="text-sm text-muted mb-4">Are you joining an existing organisation, or starting a new one?</p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5 p-1 bg-bg rounded-lg border border-line">
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
              mode === 'join' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Join existing
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
              mode === 'create' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Start a new org
          </button>
        </div>

        {mode === 'create' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            New organisations require manual approval from the Code Red team before sending messages. You'll be able to sign in straight away — full access unlocks once approved.
          </div>
        )}

        <div className="space-y-3">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoCapitalize="off" />
          {mode === 'create' && (
            <Input label="Organisation Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Sunrise Halls" />
          )}
          <Input
            label={mode === 'join' ? 'Building Code' : 'Choose a Building Code'}
            value={buildingCode}
            onChange={(e) => setBuildingCode(e.target.value.toUpperCase())}
            placeholder="e.g. RED123"
          />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
          <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }} />
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <Button onClick={handleSubmit} loading={loading} disabled={!ready} className="w-full mt-5">
          {mode === 'create' ? 'Request Organisation' : 'Create Account'}
        </Button>

        <p className="text-sm text-muted text-center mt-6 pt-6 border-t border-line">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
