import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../state/auth';

export default function Signup() {
  const navigate = useNavigate();
  const { register, ready } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [buildingCode, setBuildingCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!fullName || !email || !buildingCode || !password || !confirm) {
      setError('Please fill all fields.'); return;
    }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await register({
        buildingCode: buildingCode.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password,
        displayName: fullName.trim(),
      });
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
        <p className="text-sm text-muted mb-5">First user of a building code becomes the admin.</p>

        <div className="space-y-3">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoCapitalize="off" />
          <Input label="Building Code" value={buildingCode} onChange={(e) => setBuildingCode(e.target.value.toUpperCase())} placeholder="e.g. RED123" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
          <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" onKeyDown={(e) => { if (e.key === 'Enter') handleSignup(); }} />
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <Button onClick={handleSignup} loading={loading} disabled={!ready} className="w-full mt-5">
          Create Account
        </Button>

        <p className="text-sm text-muted text-center mt-6 pt-6 border-t border-line">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
