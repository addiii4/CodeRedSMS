import { API_BASE } from './config';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

let accessToken: string | null = null;
export function setAccessToken(token: string | null) { accessToken = token; }

/** Extracts a human-readable message from NestJS error responses. */
function parseErrorMessage(body: string, status: number): string {
    try {
        const json = JSON.parse(body);
        // NestJS shape: { statusCode, message, error }
        // message can be a string or an array of validation strings
        if (json.message) {
            return Array.isArray(json.message) ? json.message[0] : String(json.message);
        }
    } catch { /* not JSON — fall through */ }

    // Friendly fallbacks by status code
    const fallbacks: Record<number, string> = {
        400: 'Invalid request. Please check your input.',
        401: 'Incorrect credentials. Please try again.',
        403: 'You don\'t have permission to do that.',
        404: 'Not found.',
        409: 'This already exists.',
        422: 'Validation failed. Please check your input.',
        429: 'Too many requests. Please wait a moment.',
        500: 'Server error. Please try again later.',
    };
    return fallbacks[status] ?? `Something went wrong (${status}).`;
}

async function request<T>(method: HttpMethod, path: string, body?: any): Promise<T> {
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
        throw new Error(parseErrorMessage(text, res.status));
    }

    return (await res.json()) as T;
}

export const api = {
    get:    <T>(path: string)             => request<T>('GET',    path),
    post:   <T>(path: string, body?: any) => request<T>('POST',   path, body),
    patch:  <T>(path: string, body?: any) => request<T>('PATCH',  path, body),
    delete: <T>(path: string, body?: any) => request<T>('DELETE', path, body),
};
