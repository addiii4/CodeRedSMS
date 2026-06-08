import { api } from '../lib/api';

export type OrgDetails = {
    id: string;
    name: string;
    code: string;
    senderId: string | null;
    credits: number;
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
    getOrg: () => api.get<OrgDetails>('/orgs/me'),
    updateOrg: (data: { name?: string; senderId?: string }) => api.patch<OrgDetails>('/orgs/me', data),
    getMembers: () => api.get<OrgMember[]>('/orgs/me/members'),

    approveMember: (membershipId: string) => api.post(`/auth/memberships/${membershipId}/approve`),
    rejectMember:  (membershipId: string) => api.post(`/auth/memberships/${membershipId}/reject`),
    setMemberRole: (membershipId: string, role: 'admin' | 'editor' | 'viewer') =>
        api.post(`/auth/memberships/${membershipId}/role`, { role }),
};
