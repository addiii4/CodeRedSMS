import { api } from '../lib/api';

export type Template = { id: string; title: string; body: string };

export const templatesApi = {
    list: () => api.get<Template[]>('/templates'),
    create: (t: { title: string; body: string }) => api.post<Template>('/templates', t),
    update: (id: string, t: Partial<Template>) => api.patch<Template>(`/templates/${id}`, t),
    remove: (id: string) => api.delete<{ ok: boolean }>(`/templates/${id}`)
};