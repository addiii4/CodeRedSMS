import { API_BASE } from './config';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

let accessToken: string | null = null;
export function setAccessToken(token: string | null) { accessToken = token; }

async function request<T>(method: HttpMethod, path: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
}

export const api = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body?: any) => request<T>('POST', path, body),
    patch: <T>(path: string, body?: any) => request<T>('PATCH', path, body),
    delete:<T>(path: string, body?: any)  => request<T>('DELETE', path, body),
};