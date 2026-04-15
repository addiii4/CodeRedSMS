import { api } from '../lib/api';

export type OrgDetails = {
    id: string;
    name: string;
    code: string;
    senderId: string | null;
    credits: number;
};

export type OrgMember = {
    userId: string;
    email: string;
    displayName: string;
    role: 'admin' | 'editor' | 'viewer';
    joinedAt: string;
};

export const orgsApi = {
    getOrg: () =>
        api.get<OrgDetails>('/orgs/me'),

    updateOrg: (data: { name?: string; senderId?: string }) =>
        api.patch<OrgDetails>('/orgs/me', data),

    getMembers: () =>
        api.get<OrgMember[]>('/orgs/me/members'),
};
