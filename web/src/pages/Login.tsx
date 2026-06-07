import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../state/auth';

type Mode = 'quick' | 'email';

export default function Login() {
  const navigate = useNavigate();
  const { deviceLogin, login, ready } = useAuth();

  const [mode, setMode] = useState<Mode>('quick');
  const [buildingCode, setBuildingCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async () => {
    setError('');
    if (!buildingCode.trim()) { setError('Please enter your building code.'); return; }
    setLoading(true);
    try {
      await deviceLogin({ buildingCode: buildingCode.trim().toUpperCase() });
      navigate('/dashboard');
    } catch (e: any) {
      // Device not registered → prompt switch to email mode
      if (e?.message?.toLowerCase().includes('device') || e?.message?.toLowerCase().includes('not registered')) {
        setError("This browser isn't recognised yet. Sign in with your email and password to link it.");
        setMode('email');
      } else {
        setError(e?.message || 'Login failed.');
      }
    } finally { setLoading(false); }
  };

  const handleEmailLogin = async () => {
    setError('');
    if (!buildingCode.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.'); return;
    }
    setLoading(true);
    try {
      await login({
        buildingCode: buildingCode.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Sign in failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-bg px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-line shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Code Red SMS" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg font-semibold">Code Red SMS</h1>
            <p className="text-xs text-muted">Powered by VSX</p>
          </div>
        </div>

        {mode === 'quick' ? (
          <>
            <h2 className="text-xl font-semibold mb-1">Quick Sign In</h2>
            <p className="text-sm text-muted mb-5">Enter your building code to sign in on this browser.</p>
            <Input
              label="Building Code"
              placeholder="e.g. RED123"
              value={buildingCode}
              onChange={(e) => setBuildingCode(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuickLogin(); }}
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <Button onClick={handleQuickLogin} loading={loading} disabled={!ready} className="w-full mt-5">
              Continue
            </Button>
            <button onClick={() => { setError(''); setMode('email'); }} className="text-sm text-primary font-semibold mt-4 w-full text-center">
              Sign in with email &amp; password →
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-1">Sign In</h2>
            <p className="text-sm text-muted mb-5">Use your email and password to sign in on this browser.</p>
            <div className="space-y-3">
              <Input
                label="Building Code"
                placeholder="e.g. RED123"
                value={buildingCode}
                onChange={(e) => setBuildingCode(e.target.value.toUpperCase())}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="off"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEmailLogin(); }}
              />
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <Button onClick={handleEmailLogin} loading={loading} disabled={!ready} className="w-full mt-5">
              Sign In
            </Button>
            <div className="flex justify-between items-center mt-4 text-sm">
              <button onClick={() => { setError(''); setMode('quick'); }} className="text-muted hover:text-ink">
                ← Quick login
              </button>
              <Link to="/forgot-password" className="text-primary font-semibold">Forgot password?</Link>
            </div>
          </>
        )}

        <p className="text-sm text-muted text-center mt-6 pt-6 border-t border-line">
          Need an account?{' '}
          <Link to="/signup" className="text-primary font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
