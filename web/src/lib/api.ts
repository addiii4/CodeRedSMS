import { API_BASE } from './config';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

let accessToken: string | null = null;
export function setAccessToken(t: string | null) { accessToken = t; }

type AuthFailureHandler = () => void;
let authFailureHandler: AuthFailureHandler | null = null;
export function setAuthFailureHandler(fn: AuthFailureHandler | null) { authFailureHandler = fn; }

export type RequestOptions = {
  /** Skip the global 401 handler. Use for verify-password etc where 401 is expected. */
  skipAuthHandler?: boolean;
};

function parseErrorMessage(body: string, status: number): string {
  try {
    const json = JSON.parse(body);
    if (json.message) return Array.isArray(json.message) ? json.message[0] : String(json.message);
  } catch { /* not JSON */ }

  const fallbacks: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Session expired. Please log in again.',
    402: 'Insufficient credits.',
    403: "You don't have permission to do that.",
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
    if (res.status === 401 && !options.skipAuthHandler) authFailureHandler?.();
    throw new Error(parseErrorMessage(text, res.status));
  }

  // Some endpoints (DELETE) may return empty body
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export const api = {
  get:    <T>(path: string,                opts?: RequestOptions) => request<T>('GET',    path, undefined, opts),
  post:   <T>(path: string, body?: any,    opts?: RequestOptions) => request<T>('POST',   path, body,      opts),
  patch:  <T>(path: string, body?: any,    opts?: RequestOptions) => request<T>('PATCH',  path, body,      opts),
  delete: <T>(path: string, body?: any,    opts?: RequestOptions) => request<T>('DELETE', path, body,      opts),
};
