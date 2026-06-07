import { api } from '../lib/api';

export type MessageListItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  scheduledAt: string | null;
};

export type MessageDetail = {
  id: string;
  title: string;
  body: string;
  status: string;
  recipients: number;
  createdAt: string;
  scheduledAt: string | null;
  breakdown: Record<string, number>;
};

export const messagesApi = {
  list: () => api.get<{ items: MessageListItem[] }>('/messages'),
  get: (id: string) => api.get<MessageDetail>(`/messages/${id}`),
  estimate: (body: string) => api.post<{ segments: number }>('/messages/estimate', { body }),
  create: (payload: {
    title: string;
    body: string;
    groupIds?: string[];
    contactIds?: string[];
    adHocNumbers?: string[];
    scheduledAt?: string | null;
  }) => api.post<{ id: string; recipients: number; segments: number; cost: number; status: string }>('/messages', payload),
};
