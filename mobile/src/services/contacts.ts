import { api } from '../lib/api';

export type Contact = { id: string; fullName: string; phoneE164: string };

export const contactsApi = {
    list: () => api.get<Contact[]>('/contacts'),
    create: (c: { fullName: string; phoneE164: string }) => api.post<Contact>('/contacts', c),
    update: (id: string, c: Partial<Contact>) => api.patch<Contact>(`/contacts/${id}`, c),
    remove: (id: string) => api.delete<{ ok: boolean }>(`/contacts/${id}`)
};