import { useEffect, useState } from 'react';
import { useAuth } from '../state/auth';
import { orgsApi } from '../services/orgs';

/**
 * Polls /orgs/me/members for pending count when the current user is an org
 * admin. Returns 0 for non-admins or when fetch fails. Used to drive the
 * "approval needed" badge in the sidebar / Settings rows.
 */
export function usePendingMembers(pollMs = 60_000) {
  const { activeMembership } = useAuth();
  const isAdmin = activeMembership?.role === 'admin';
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) { setCount(0); return; }
    let alive = true;
    const load = () => {
      orgsApi.getMembers()
        .then((members) => { if (alive) setCount(members.filter((m) => m.status === 'pending').length); })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, pollMs);
    return () => { alive = false; clearInterval(id); };
  }, [isAdmin, pollMs]);

  return count;
}
