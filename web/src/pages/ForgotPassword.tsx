import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [buildingCode, setBuildingCode] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError('');
    if (!buildingCode.trim() || !email.trim() || !newPassword || !confirm) {
      setError('Please fill all fields.'); return;
    }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', {
        buildingCode: buildingCode.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        newPassword,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Reset failed — invalid building code or email.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-line shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 grid place-items-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-xl font-semibold mb-2">Password Reset</h2>
          <p className="text-sm text-muted mb-5">Your password has been updated. You can sign in with the new password now.</p>
          <Button onClick={() => navigate('/login')} className="w-full">Back to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-bg px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-line shadow-sm p-8">
        <h2 className="text-xl font-semibold mb-1">Reset Password</h2>
        <p className="text-sm text-muted mb-5">Enter your building code and email to set a new password.</p>

        <div className="space-y-3">
          <Input label="Building Code" value={buildingCode} onChange={(e) => setBuildingCode(e.target.value.toUpperCase())} placeholder="e.g. RED123" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoCapitalize="off" />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
          <Input label="Confirm New Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" onKeyDown={(e) => { if (e.key === 'Enter') handleReset(); }} />
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <Button onClick={handleReset} loading={loading} className="w-full mt-5">Reset Password</Button>

        <p className="text-sm text-muted text-center mt-6">
          <Link to="/login" className="text-primary font-semibold">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
