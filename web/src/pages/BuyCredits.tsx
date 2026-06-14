import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { paymentsApi } from '../services/payments';

type PlanKey = 'starter' | 'team' | 'enterprise' | 'custom';
const PLANS: Record<Exclude<PlanKey, 'custom'>, { credits: number; price: number; label: string }> = {
  starter:    { credits: 500,   price: 49,  label: 'Starter' },
  team:       { credits: 2000,  price: 149, label: 'Team' },
  enterprise: { credits: 10000, price: 599, label: 'Enterprise' },
};

export default function BuyCredits() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PlanKey>('starter');
  const [customCredits, setCustomCredits] = useState('');
  const [currentCredits, setCurrentCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    paymentsApi.balance().then((b) => setCurrentCredits(b.credits)).catch(() => {});
  }, []);

  const { credits, price } = (() => {
    if (selected === 'custom') {
      const c = Math.max(0, parseInt(customCredits || '0', 10));
      const unit = c >= 10000 ? 0.07 : c >= 2000 ? 0.08 : 0.10;
      return { credits: c, price: +(c * unit).toFixed(2) };
    }
    const p = PLANS[selected];
    return { credits: p.credits, price: p.price };
  })();

  const handleCheckout = async () => {
    if (!price) return;
    setLoading(true);
    try {
      const res = await paymentsApi.checkout({ amount: price, credits });
      window.location.href = res.url;
    } catch (e: any) {
      alert('Checkout failed: ' + (e?.message || 'Try again.'));
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Buy Credits</h1>
      <p className="text-sm text-muted mb-6">Current balance: <b>{currentCredits.toLocaleString()}</b> credits</p>

      {/* Plan grid */}
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        {(Object.entries(PLANS) as [Exclude<PlanKey,'custom'>, typeof PLANS.starter][]).map(([key, p]) => (
          <Card
            key={key}
            onClick={() => setSelected(key)}
            className={`text-center transition ${
              selected === key ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">{p.label}</div>
            <div className="text-3xl font-bold mt-2">{p.credits.toLocaleString()}</div>
            <div className="text-xs text-muted">credits</div>
            <div className="text-lg font-semibold text-primary mt-3">${p.price}</div>
          </Card>
        ))}
      </div>

      {/* Custom amount */}
      <Card className={`mb-6 ${selected === 'custom' ? 'ring-2 ring-primary' : ''}`}>
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Custom</div>
        <input
          type="number"
          placeholder="Enter credits"
          value={customCredits}
          onChange={(e) => { setSelected('custom'); setCustomCredits(e.target.value.replace(/[^0-9]/g, '')); }}
          className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white"
        />
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted">Credits</span>
          <span>{credits.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted">Estimated messages</span>
          <span>{credits.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-line pt-2 mt-2">
          <span>Total</span>
          <span className="text-primary">${price.toFixed(2)}</span>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleCheckout} loading={loading} disabled={!price}>
          <span className="inline-flex items-center gap-2"><CreditCard size={14} /> Checkout via Stripe</span>
        </Button>
      </div>
    </div>
  );
}
