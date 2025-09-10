import { api } from '../lib/api';

export type CreateMessagePayload = {
    title: string;
    body: string;
    groupIds?: string[];
    contactIds?: string[];
    adHocNumbers?: string[];
    scheduledAt?: string | null; // ISO
};

export type CreateMessageResponse = {
    id: string;
    recipients: number;
    segments: number;
    cost: number;
};

export const messagesApi = {
    estimate: async (body: string): Promise<{ segments: number }> => {
        return api.post('/messages/estimate', { body });
    },
    create: async (payload: CreateMessagePayload): Promise<CreateMessageResponse> => {
        return api.post('/messages', payload);
    },
    list: async (): Promise<{ items: { id: string; title: string; status: string; createdAt: string; scheduledAt: string | null }[] }> => {
        return api.get('/messages');
    },
    get: async (id: string): Promise<{
        id: string;
        title: string;
        body: string;
        status: string;
        recipients: number;
        createdAt: string;
        scheduledAt: string | null;
        breakdown: Record<string, number>;
    }> => {
        return api.get(`/messages/${id}`);
    }
};