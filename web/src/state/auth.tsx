import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAccessToken, setAuthFailureHandler } from '../lib/api';

type User = { id: string; email: string; displayName: string };
type Org  = { id: string; code: string; name: string; status: 'pending' | 'active' | 'suspended'; credits?: number };
type Membership = {
  id: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  org: Org;
};
type AuthPayload = { accessToken: string; user: User };
type MeResponse  = { user: User; memberships: Membership[] };

type RegisterArgs =
  | { mode: 'join';   email: string; password: string; displayName?: string; buildingCode: string }
  | { mode: 'create'; email: string; password: string; displayName?: string; buildingCode: string; orgName: string };

type AuthContextType = {
  ready: boolean;
  user: User | null;
  memberships: Membership[];
  activeMembership: Membership | null;
  register: (args: RegisterArgs) => Promise<void>;
  login: (p: { email: string; password: string }) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextType>(null as any);

const TOKEN_KEY = 'codered_access_token';
const USER_KEY  = 'codered_user';
const MEM_KEY   = 'codered_memberships';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady]               = useState(false);
  const [user, setUser]                 = useState<User | null>(null);
  const [memberships, setMemberships]   = useState<Membership[]>([]);
  const navigate = useNavigate();

  const clearSession = () => {
    setUser(null);
    setMemberships([]);
    setAccessToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(MEM_KEY);
  };

  const persistMe = (me: MeResponse) => {
    setUser(me.user);
    setMemberships(me.memberships);
    localStorage.setItem(USER_KEY, JSON.stringify(me.user));
    localStorage.setItem(MEM_KEY, JSON.stringify(me.memberships));
  };

  const refreshMe = async () => {
    const me = await api.get<MeResponse>('/auth/me');
    persistMe(me);
  };

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSession();
      navigate('/login', { replace: true });
    });

    const token   = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const memStr  = localStorage.getItem(MEM_KEY);
    if (token && userStr) {
      setAccessToken(token);
      try {
        setUser(JSON.parse(userStr));
        if (memStr) setMemberships(JSON.parse(memStr));
      } catch { clearSession(); }
      // Refresh in background to pick up status changes (e.g. just got approved)
      refreshMe().catch(() => {});
    }
    setReady(true);
    return () => setAuthFailureHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register: AuthContextType['register'] = async (args) => {
    const data = await api.post<AuthPayload>('/auth/register', args);
    setAccessToken(data.accessToken);
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    await refreshMe();
  };

  const login: AuthContextType['login'] = async ({ email, password }) => {
    const data = await api.post<AuthPayload>('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    await refreshMe();
  };

  const logout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const activeMembership = useMemo(
    () => memberships.find((m) => m.status === 'active' && m.org.status === 'active') ?? null,
    [memberships],
  );

  const value = useMemo<AuthContextType>(
    () => ({ ready, user, memberships, activeMembership, register, login, refreshMe, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, user, memberships, activeMembership],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
