import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAccessToken, setAuthFailureHandler } from '../lib/api';
import { navigationRef } from '../lib/navigationRef';

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
    logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType>(null as any);

const TOKEN_KEY = 'codered_access_token';
const USER_KEY  = 'codered_user';
const MEM_KEY   = 'codered_memberships';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady]             = useState(false);
    const [user, setUser]               = useState<User | null>(null);
    const [memberships, setMemberships] = useState<Membership[]>([]);

    const clearSession = async () => {
        setUser(null);
        setMemberships([]);
        setAccessToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        await SecureStore.deleteItemAsync(MEM_KEY);
    };

    const persistMe = async (me: MeResponse) => {
        setUser(me.user);
        setMemberships(me.memberships);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(me.user));
        await SecureStore.setItemAsync(MEM_KEY, JSON.stringify(me.memberships));
    };

    const refreshMe = async () => {
        const me = await api.get<MeResponse>('/auth/me');
        await persistMe(me);
    };

    useEffect(() => {
        setAuthFailureHandler(async () => {
            await clearSession();
            if (navigationRef.isReady()) {
                navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
        });

        (async () => {
            const token   = await SecureStore.getItemAsync(TOKEN_KEY);
            const userStr = await SecureStore.getItemAsync(USER_KEY);
            const memStr  = await SecureStore.getItemAsync(MEM_KEY);
            if (token && userStr) {
                setAccessToken(token);
                try {
                    setUser(JSON.parse(userStr));
                    if (memStr) setMemberships(JSON.parse(memStr));
                } catch { await clearSession(); }
                refreshMe().catch(() => {});
            }
            setReady(true);
        })();

        return () => setAuthFailureHandler(null);
    }, []);

    const register: AuthContextType['register'] = async (args) => {
        const data = await api.post<AuthPayload>('/auth/register', args);
        setAccessToken(data.accessToken);
        await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
        await refreshMe();
    };

    const login: AuthContextType['login'] = async ({ email, password }) => {
        const data = await api.post<AuthPayload>('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
        await refreshMe();
    };

    const logout = async () => { await clearSession(); };

    const activeMembership = useMemo(
        () => memberships.find((m) => m.status === 'active' && m.org.status === 'active') ?? null,
        [memberships],
    );

    const value = useMemo<AuthContextType>(
        () => ({ ready, user, memberships, activeMembership, register, login, refreshMe, logout }),
        [ready, user, memberships, activeMembership],
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    return useContext(AuthCtx);
}
