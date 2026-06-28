import { api } from '../lib/api';

export const paymentsApi = {
  balance: () => api.get<{ credits: number }>('/payments/balance'),
  history: () => api.get<{ items: { id: string; createdAt: string; amount: number; credits: number; status: string }[] }>('/payments/history'),
  checkout: (body: { amount: number; credits: number }) =>
    api.post<{ url: string }>('/payments/checkout', body),
};
