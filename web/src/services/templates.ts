import { api } from '../lib/api';

export type Template = { id: string; title: string; body: string; createdAt: string };

export const templatesApi = {
  list:   () => api.get<Template[]>('/templates'),
  create: (data: { title: string; body: string }) => api.post<Template>('/templates', data),
  update: (id: string, data: { title?: string; body?: string }) => api.patch<Template>(`/templates/${id}`, data),
  remove: (id: string) => api.delete<{ ok: boolean }>(`/templates/${id}`),
};
