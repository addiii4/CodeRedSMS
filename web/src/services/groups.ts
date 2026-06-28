import { api } from '../lib/api';
import { Contact } from './contacts';

export type GroupMember = { id: string; contact: Contact };
export type Group = { id: string; name: string; description?: string | null; members?: GroupMember[] };

export const groupsApi = {
  list:   () => api.get<Group[]>('/groups'),
  create: (data: { name: string; description?: string }) => api.post<Group>('/groups', data),
  update: (id: string, data: { name?: string; description?: string }) => api.patch<Group>(`/groups/${id}`, data),
  remove: (id: string) => api.delete<{ ok: boolean }>(`/groups/${id}`),
  addMember:    (groupId: string, contactId: string) => api.post(`/groups/${groupId}/members`, { contactId }),
  removeMember: (groupId: string, contactId: string) => api.delete(`/groups/${groupId}/members`, { contactId }),
};
