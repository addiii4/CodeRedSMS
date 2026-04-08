import { api } from '../lib/api';

export type PurchaseHistoryItem = {
    id: string;
    amount: number;
    reason: string;
    stripePaymentId: string | null;
    createdAt: string;
};

export const paymentsApi = {
    checkout: (payload: { amount: number; credits: number }) =>
        api.post<{ url: string }>('/payments/checkout', payload),

    balance: () =>
        api.get<{ credits: number }>('/payments/balance'),

    history: () =>
        api.get<{ items: PurchaseHistoryItem[] }>('/payments/history'),
};