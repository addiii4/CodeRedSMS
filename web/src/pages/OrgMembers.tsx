import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, User } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { orgsApi, OrgMember } from '../services/orgs';
import { useAuth } from '../state/auth';

const ROLE_LABEL: Record<OrgMember['role'], string> = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
const ROLES: OrgMember['role'][] = ['admin', 'editor', 'viewer'];

export default function OrgMembers() {
  const navigate = useNavigate();
  const { activeMembership } = useAuth();
  const isAdmin = activeMembership?.role === 'admin';

  const [members, setMembers] = useState<OrgMember[]>([]);

  const load = () => orgsApi.getMembers().then(setMembers).catch(() => {});
  useEffect(() => { load(); }, []);

  const pending = members.filter((m) => m.status === 'pending');
  const active  = members.filter((m) => m.status === 'active');

  const approve = async (m: OrgMember) => {
    try { await orgsApi.approveMember(m.membershipId); load(); }
    catch (e: any) { alert('Approve failed: ' + (e?.message || 'Try again.')); }
  };
  const reject  = async (m: OrgMember) => {
    if (!confirm(`Reject ${m.displayName}'s access request?`)) return;
    try { await orgsApi.rejectMember(m.membershipId); load(); }
    catch (e: any) { alert('Reject failed: ' + (e?.message || 'Try again.')); }
  };
  const setRole = async (m: OrgMember, role: OrgMember['role']) => {
    try { await orgsApi.setRole(m.membershipId, role); load(); }
    catch (e: any) { alert('Update failed: ' + (e?.message || 'Try again.')); }
  };

  return (
    <div>
      <button onClick={() => navigate('/settings')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Settings
      </button>
      <h1 className="text-2xl font-bold mb-1">Members</h1>
      <p className="text-sm text-muted mb-6">
        {isAdmin ? 'Approve new members and manage roles.' : 'View who has access to your organisation.'}
      </p>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Pending approval · {pending.length}
          </h2>
          <div className="space-y-2">
            {pending.map((m) => (
              <Card key={m.membershipId} className="flex items-center gap-3 bg-amber-50 border-amber-200">
                <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 grid place-items-center shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{m.displayName}</div>
                  <div className="text-xs text-muted truncate">{m.email}</div>
                </div>
                {isAdmin ? (
                  <div className="flex gap-2">
                    <Button onClick={() => approve(m)}><span className="inline-flex items-center gap-1"><Check size={14} /> Approve</span></Button>
                    <Button variant="secondary" onClick={() => reject(m)}><span className="inline-flex items-center gap-1"><X size={14} /> Reject</span></Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted">Waiting…</span>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active */}
      <div>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Active members · {active.length}
        </h2>
        {active.length === 0 ? (
          <Card className="text-center text-muted text-sm">No active members.</Card>
        ) : (
          <Card className="p-0 divide-y divide-line">
            {active.map((m) => (
              <div key={m.membershipId} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{m.displayName}</div>
                  <div className="text-xs text-muted truncate">{m.email}</div>
                </div>
                {isAdmin && m.userId !== activeMembership?.org.id ? (
                  <select
                    value={m.role}
                    onChange={(e) => setRole(m, e.target.value as OrgMember['role'])}
                    className="px-2 py-1 border border-line rounded-md text-xs bg-white"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                ) : (
                  <span className="text-xs uppercase tracking-wider text-muted">{ROLE_LABEL[m.role]}</span>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
