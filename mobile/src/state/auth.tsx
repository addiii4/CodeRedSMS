import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAccessToken, setAuthFailureHandler } from '../lib/api';
import { navigationRef } from '../lib/navigationRef';
import 'react-native-get-random-values';
import { Platform } from 'react-native';
import { v4 as uuid } from 'uuid';

type User = { id: string; email: string; displayName: string };
type Org  = { id: string; code: string; name: string; credits: number };
type AuthPayload = { accessToken: string; user: User; org: Org };

type AuthContextType = {
    ready: boolean;
    user: User | null;
    org: Org | null;
    deviceId: string | null;
    register: (p: { buildingCode: string; email: string; password: string; displayName?: string }) => Promise<void>;
    login: (p: { buildingCode: string; email: string; password: string }) => Promise<void>;
    deviceLogin: (p: { buildingCode: string }) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType>(null as any);

const DEVICE_ID_KEY = 'codered_device_id';
const TOKEN_KEY     = 'codered_access_token';
const USER_KEY      = 'codered_user';
const ORG_KEY       = 'codered_org';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady]     = useState(false);
    const [user, setUser]       = useState<User | null>(null);
    const [org, setOrg]         = useState<Org | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    // ─── Session helpers ───────────────────────────────────────────────────────

    const clearSession = async () => {
        setUser(null);
        setOrg(null);
        setAccessToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        await SecureStore.deleteItemAsync(ORG_KEY);
    };

    const saveSession = async (p: AuthPayload) => {
        setAccessToken(p.accessToken);
        await SecureStore.setItemAsync(TOKEN_KEY, p.accessToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(p.user));
        await SecureStore.setItemAsync(ORG_KEY, JSON.stringify(p.org));
        setUser(p.user);
        setOrg(p.org);
    };

    // ─── Startup: restore session + register 401 handler ──────────────────────

    useEffect(() => {
        // Register global 401 handler — fires when any API call gets Unauthorized.
        // This catches expired tokens mid-session and boots the user back to Login.
        setAuthFailureHandler(async () => {
            console.warn('[Auth] 401 received — clearing session and redirecting to Login');
            await clearSession();
            if (navigationRef.isReady()) {
                navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
        });

        (async () => {
            // Restore / generate device ID
            let d = await SecureStore.getItemAsync(DEVICE_ID_KEY);
            if (!d) {
                d = uuid();
                await SecureStore.setItemAsync(DEVICE_ID_KEY, d);
            }
            setDeviceId(d);

            // Restore persisted session
            const token    = await SecureStore.getItemAsync(TOKEN_KEY);
            const userJson = await SecureStore.getItemAsync(USER_KEY);
            const orgJson  = await SecureStore.getItemAsync(ORG_KEY);

            if (token && userJson && orgJson) {
                setAccessToken(token);
                try {
                    setUser(JSON.parse(userJson));
                    setOrg(JSON.parse(orgJson));
                } catch {
                    // Corrupt stored data — wipe it so the user can log in cleanly
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                    await SecureStore.deleteItemAsync(USER_KEY);
                    await SecureStore.deleteItemAsync(ORG_KEY);
                }
            }

            setReady(true);
        })();

        return () => {
            setAuthFailureHandler(null);
        };
    }, []);

    // ─── Auth actions ──────────────────────────────────────────────────────────

    const register = async ({
        buildingCode,
        email,
        password,
        displayName,
    }: {
        buildingCode: string;
        email: string;
        password: string;
        displayName?: string;
    }) => {
        if (!deviceId) throw new Error('Device not ready');
        const data = await api.post<AuthPayload>('/auth/register', {
            buildingCode, email, password, deviceId, platform: Platform.OS, displayName,
        });
        await saveSession(data);
    };

    /** Email + password login — also registers this device so future quick-logins work. */
    const login = async ({
        buildingCode,
        email,
        password,
    }: {
        buildingCode: string;
        email: string;
        password: string;
    }) => {
        if (!deviceId) throw new Error('Device not ready');
        const data = await api.post<AuthPayload>('/auth/login', {
            buildingCode, email, password, deviceId, platform: Platform.OS,
        });
        await saveSession(data);
    };

    /** Quick login using device ID only. Works after the device has been registered via login(). */
    const deviceLogin = async ({ buildingCode }: { buildingCode: string }) => {
        if (!deviceId) throw new Error('Device not ready');
        const data = await api.post<AuthPayload>('/auth/device-login', {
            buildingCode, deviceId,
        });
        await saveSession(data);
    };

    const logout = async () => {
        await clearSession();
    };

    // ─── Context value ─────────────────────────────────────────────────────────

    const value = useMemo(
        () => ({ ready, user, org, deviceId, register, login, deviceLogin, logout }),
        [ready, user, org, deviceId],
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    return useContext(AuthCtx);
}
