import { api } from '../lib/api';
import type { Contact } from './contacts';

export type Group = { id: string; name: string; description?: string | null; members?: { id: string; contact: Contact }[] };

export const groupsApi = {
    list: () => api.get<Group[]>('/groups'),
    create: (g: { name: string; description?: string }) => api.post<Group>('/groups', g),
    update: (id: string, g: Partial<Group>) => api.patch<Group>(`/groups/${id}`, g),
    remove: (id: string) => api.delete<{ ok: boolean }>(`/groups/${id}`),
    addMember: (groupId: string, contactId: string) => api.post<{ ok: boolean }>(`/groups/${groupId}/members`, { contactId }),
    removeMember: (groupId: string, contactId: string) => api.delete<{ ok: boolean }>(`/groups/${groupId}/members`, { contactId }),
};