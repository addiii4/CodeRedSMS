import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Card from '../components/Card';
import { paymentsApi } from '../services/payments';

type Item = { id: string; createdAt: string; amount: number; credits: number; status: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi.history()
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Purchase History</h1>
      <p className="text-sm text-muted mb-6">Every credit purchase, newest first.</p>

      {loading ? (
        <Card className="text-center text-muted text-sm">Loading…</Card>
      ) : items.length === 0 ? (
        <Card className="text-center text-muted text-sm py-10">No purchases yet.</Card>
      ) : (
        <Card className="p-0 divide-y divide-line">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.credits.toLocaleString()} credits</div>
                <div className="text-xs text-muted">{formatDate(p.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">${p.amount.toFixed(2)}</div>
                <div className="text-xs uppercase tracking-wider text-muted">{p.status}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
