import { api } from '../lib/api';

export type UserProfile = {
    id: string;
    email: string;
    displayName: string;
};

export const usersApi = {
    getMe: () =>
        api.get<UserProfile>('/users/me'),

    updateMe: (data: { displayName: string }) =>
        api.patch<UserProfile>('/users/me', data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.post<{ ok: boolean }>('/users/me/change-password', data),
};
