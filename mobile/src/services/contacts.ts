import { api } from '../lib/api';

export type Contact = { id: string; fullName: string; phoneE164: string };

export type BulkImportRow = { fullName: string; phoneE164: string; groupNames?: string[] };
export type BulkImportResult = { imported: number; skipped: number; errors: string[] };

export const contactsApi = {
    list: () => api.get<Contact[]>('/contacts'),
    create: (c: { fullName: string; phoneE164: string }) => api.post<Contact>('/contacts', c),
    update: (id: string, c: Partial<Contact>) => api.patch<Contact>(`/contacts/${id}`, c),
    remove: (id: string) => api.delete<{ ok: boolean }>(`/contacts/${id}`),
    bulkImport: (rows: BulkImportRow[]) =>
        api.post<BulkImportResult>('/contacts/bulk-import', { rows }),
};