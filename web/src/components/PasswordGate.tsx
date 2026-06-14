import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import Button from './Button';
import { api } from '../lib/api';

type Props = {
  open: boolean;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

/**
 * Password-confirmation modal used before sensitive actions (e.g. opening
 * the Buy Credits screen). Skips the global 401 handler so a wrong password
 * shows an error instead of logging the user out.
 */
export default function PasswordGate({ open, title = 'Confirm Password', subtitle, onSuccess, onCancel }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!password) { setError('Enter your password.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/verify-password', { password }, { skipAuthHandler: true });
      setPassword('');
      onSuccess();
    } catch {
      setError('Incorrect password. Please try again.');
    } finally { setLoading(false); }
  };

  const handleCancel = () => { setPassword(''); setError(''); onCancel(); };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center px-4 z-50" onClick={handleCancel}>
      <div className="bg-white rounded-2xl border border-line shadow-lg w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={handleCancel} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
          autoFocus
          className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white"
        />

        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

        <div className="flex gap-2 mt-4">
          <Button variant="ghost" onClick={handleCancel} className="flex-1">Cancel</Button>
          <Button onClick={handleConfirm} loading={loading} className="flex-1">Confirm</Button>
        </div>
      </div>
    </div>
  );
}
