import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../state/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login, ready } = useAuth();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
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

        <h2 className="text-xl font-semibold mb-1">Sign In</h2>
        <p className="text-sm text-muted mb-5">Welcome back. Sign in with your email.</p>

        <div className="space-y-3">
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <Button onClick={handleSubmit} loading={loading} disabled={!ready} className="w-full mt-5">
          Sign In
        </Button>

        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-sm text-primary font-semibold">Forgot password?</Link>
        </div>

        <p className="text-sm text-muted text-center mt-6 pt-6 border-t border-line">
          Need an account?{' '}
          <Link to="/signup" className="text-primary font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
