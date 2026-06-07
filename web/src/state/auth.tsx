import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAccessToken, setAuthFailureHandler } from '../lib/api';

type User = { id: string; email: string; displayName: string };
type Org  = { id: string; code: string; name: string; credits?: number };
type AuthPayload = { accessToken: string; user: User; org: Org };

type AuthContextType = {
  ready: boolean;
  user: User | null;
  org: Org | null;
  deviceId: string | null;
  register: (p: { buildingCode: string; email: string; password: string; displayName?: string }) => Promise<void>;
  login: (p: { buildingCode: string; email: string; password: string }) => Promise<void>;
  deviceLogin: (p: { buildingCode: string }) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextType>(null as any);

// Same key naming as mobile so behaviour is consistent across our codebase
const DEVICE_ID_KEY = 'codered_device_id';
const TOKEN_KEY     = 'codered_access_token';
const USER_KEY      = 'codered_user';
const ORG_KEY       = 'codered_org';

/** Generate a stable random device ID for this browser. */
function makeDeviceId(): string {
  // Browser crypto is available everywhere we care about
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return 'web-' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady]     = useState(false);
  const [user, setUser]       = useState<User | null>(null);
  const [org, setOrg]         = useState<Org | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearSession = () => {
    setUser(null);
    setOrg(null);
    setAccessToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ORG_KEY);
  };

  const saveSession = (p: AuthPayload) => {
    setAccessToken(p.accessToken);
    localStorage.setItem(TOKEN_KEY, p.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(p.user));
    localStorage.setItem(ORG_KEY, JSON.stringify(p.org));
    setUser(p.user);
    setOrg(p.org);
  };

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSession();
      navigate('/login', { replace: true });
    });

    // Restore / generate device id
    let d = localStorage.getItem(DEVICE_ID_KEY);
    if (!d) { d = makeDeviceId(); localStorage.setItem(DEVICE_ID_KEY, d); }
    setDeviceId(d);

    // Restore session
    const token    = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    const orgJson  = localStorage.getItem(ORG_KEY);
    if (token && userJson && orgJson) {
      setAccessToken(token);
      try {
        setUser(JSON.parse(userJson));
        setOrg(JSON.parse(orgJson));
      } catch { clearSession(); }
    }
    setReady(true);

    return () => setAuthFailureHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register: AuthContextType['register'] = async ({ buildingCode, email, password, displayName }) => {
    if (!deviceId) throw new Error('Device not ready');
    const data = await api.post<AuthPayload>('/auth/register', {
      buildingCode, email, password, deviceId, platform: 'web', displayName,
    });
    saveSession(data);
  };

  const login: AuthContextType['login'] = async ({ buildingCode, email, password }) => {
    if (!deviceId) throw new Error('Device not ready');
    const data = await api.post<AuthPayload>('/auth/login', {
      buildingCode, email, password, deviceId, platform: 'web',
    });
    saveSession(data);
  };

  const deviceLogin: AuthContextType['deviceLogin'] = async ({ buildingCode }) => {
    if (!deviceId) throw new Error('Device not ready');
    const data = await api.post<AuthPayload>('/auth/device-login', {
      buildingCode, deviceId,
    });
    saveSession(data);
  };

  const logout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({ ready, user, org, deviceId, register, login, deviceLogin, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, user, org, deviceId],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
