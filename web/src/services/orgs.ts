import { api } from '../lib/api';

export type OrgDetails = {
  id: string; name: string; code: string;
  senderId: string | null; credits: number;
  status: 'pending' | 'active' | 'suspended';
};

export type OrgMember = {
  membershipId: string;
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  joinedAt: string;
};

export const orgsApi = {
  getOrg:     () => api.get<OrgDetails>('/orgs/me'),
  updateOrg:  (data: { name?: string }) => api.patch<OrgDetails>('/orgs/me', data),
  getMembers: () => api.get<OrgMember[]>('/orgs/me/members'),

  approveMember: (id: string) => api.post(`/auth/memberships/${id}/approve`),
  rejectMember:  (id: string) => api.post(`/auth/memberships/${id}/reject`),
  setRole:       (id: string, role: 'admin' | 'editor' | 'viewer') => api.post(`/auth/memberships/${id}/role`, { role }),
};
