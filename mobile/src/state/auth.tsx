import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAccessToken } from '../lib/api';
import { Platform } from 'react-native';
import { v4 as uuid } from 'uuid';

type User = { id: string; email: string; displayName: string };
type Org = { id: string; code: string; name: string; credits: number };
type AuthPayload = { accessToken: string; user: User; org: Org };

type AuthContextType = {
    ready: boolean;
    user: User | null;
    org: Org | null;
    deviceId: string | null;
    register: (p: { buildingCode: string; email: string; password: string }) => Promise<void>;
    deviceLogin: (p: { buildingCode: string }) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType>(null as any);

const DEVICE_ID_KEY = 'codered_device_id';
const TOKEN_KEY = 'codered_access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [org, setOrg] = useState<Org | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let d = await SecureStore.getItemAsync(DEVICE_ID_KEY);
            if (!d) {
                d = uuid();
                await SecureStore.setItemAsync(DEVICE_ID_KEY, d);
            }
            setDeviceId(d);

            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) setAccessToken(token);
            setReady(true);
        })();
    }, []);

    const saveSession = async (p: AuthPayload) => {
        setAccessToken(p.accessToken);
        await SecureStore.setItemAsync(TOKEN_KEY, p.accessToken);
        setUser(p.user);
        setOrg(p.org);
    };

    const register = async ({ buildingCode, email, password }: { buildingCode: string; email: string; password: string; }) => {
        if (!deviceId) throw new Error('Device not ready');
        const data = await api.post<AuthPayload>('/auth/register', {
            buildingCode, email, password, deviceId, platform: Platform.OS
        });
        await saveSession(data);
    };

    const deviceLogin = async ({ buildingCode }: { buildingCode: string; }) => {
        if (!deviceId) throw new Error('Device not ready');
        const data = await api.post<AuthPayload>('/auth/device-login', {
            buildingCode, deviceId
        });
        await saveSession(data);
    };

    const logout = async () => {
        setUser(null);
        setOrg(null);
        setAccessToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    };

    const value = useMemo(() => ({ ready, user, org, deviceId, register, deviceLogin, logout }), [ready, user, org, deviceId]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    return useContext(AuthCtx);
}