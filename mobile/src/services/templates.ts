import { api } from '../lib/api';

export type Template = { id: string; title: string; body: string };

export const templatesApi = {
    list: () => api.get<Template[]>('/templates'),
    create: (payload: { title: string; body: string }) =>
        api.post<Template>('/templates', payload),
    update: (id: string, payload: Partial<Template>) =>
        api.patch<Template>(`/templates/${id}`, payload),
    remove: (id: string) =>
        api.delete<{ ok: boolean }>(`/templates/${id}`),
};