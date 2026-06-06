import { API_BASE } from './config';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

let accessToken: string | null = null;
export function setAccessToken(token: string | null) { accessToken = token; }

/**
 * Registered by auth.tsx on mount. Fires when ANY request (except those that
 * opt out via { skipAuthHandler: true }) gets HTTP 401. Used to clear the
 * stored session and bounce the user back to Login.
 */
type AuthFailureHandler = () => void;
let authFailureHandler: AuthFailureHandler | null = null;
export function setAuthFailureHandler(fn: AuthFailureHandler | null) {
    authFailureHandler = fn;
}

/** Per-request options. Currently only one knob. */
export type RequestOptions = {
    /**
     * Skip the global 401 handler for this request. Use for endpoints where a
     * 401 is an EXPECTED outcome of a user action (e.g. /auth/verify-password
     * — wrong password returns 401 but should NOT log the user out).
     */
    skipAuthHandler?: boolean;
};

/** Extracts a human-readable message from NestJS error responses. */
function parseErrorMessage(body: string, status: number): string {
    try {
        const json = JSON.parse(body);
        if (json.message) {
            return Array.isArray(json.message) ? json.message[0] : String(json.message);
        }
    } catch { /* not JSON — fall through */ }

    const fallbacks: Record<number, string> = {
        400: 'Invalid request. Please check your input.',
        401: 'Session expired. Please log in again.',
        402: 'Insufficient credits.',
        403: 'You don\'t have permission to do that.',
        404: 'Not found.',
        409: 'This already exists.',
        422: 'Validation failed. Please check your input.',
        429: 'Too many requests. Please wait a moment.',
        500: 'Server error. Please try again later.',
    };
    return fallbacks[status] ?? `Something went wrong (${status}).`;
}

async function request<T>(
    method: HttpMethod,
    path: string,
    body?: any,
    options: RequestOptions = {},
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');

        // 401 = token expired or invalid — trigger global session clear
        // UNLESS the caller has opted out (e.g. verify-password where 401 is normal).
        if (res.status === 401 && !options.skipAuthHandler) {
            authFailureHandler?.();
        }

        throw new Error(parseErrorMessage(text, res.status));
    }

    return (await res.json()) as T;
}

export const api = {
    get:    <T>(path: string,                opts?: RequestOptions) => request<T>('GET',    path, undefined, opts),
    post:   <T>(path: string, body?: any,    opts?: RequestOptions) => request<T>('POST',   path, body,      opts),
    patch:  <T>(path: string, body?: any,    opts?: RequestOptions) => request<T>('PATCH',  path, body,      opts),
    delete: <T>(path: string, body?: any,    opts?: RequestOptions) => request<T>('DELETE', path, body,      opts),
};
