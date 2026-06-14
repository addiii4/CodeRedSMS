import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { templatesApi, Template } from '../services/templates';

type EditState = { id?: string; title: string; body: string } | null;

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<EditState>(null);
  const [saving, setSaving] = useState(false);

  const load = () => templatesApi.list().then(setTemplates).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.body.trim()) { alert('Title and body required.'); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await templatesApi.update(editing.id, { title: editing.title.trim(), body: editing.body.trim() });
      } else {
        await templatesApi.create({ title: editing.title.trim(), body: editing.body.trim() });
      }
      setEditing(null);
      load();
    } catch (e: any) {
      alert('Save failed: ' + (e?.message || 'Try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Template) => {
    if (!confirm(`Delete template "${t.title}"?`)) return;
    try { await templatesApi.remove(t.id); load(); }
    catch (e: any) { alert('Delete failed: ' + (e?.message || 'Try again.')); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-muted">Reusable messages for emergencies and updates.</p>
        </div>
        <Button onClick={() => setEditing({ title: '', body: '' })}>
          <span className="inline-flex items-center gap-2"><Plus size={14} /> New Template</span>
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="text-center text-muted text-sm py-10">No templates yet. Click <b>New Template</b> to add one.</Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {templates.map((t) => (
            <Card key={t.id} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm mb-1">{t.title}</div>
                <div className="text-xs text-muted line-clamp-3 whitespace-pre-wrap">{t.body}</div>
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" onClick={() => navigate('/compose', { state: { presetTitle: t.title, presetBody: t.body } })}>
                    Use
                  </Button>
                  <button onClick={() => setEditing({ id: t.id, title: t.title, body: t.body })} className="text-muted hover:text-ink"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(t)} className="text-muted hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Inline edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center px-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl border border-line shadow-lg w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing.id ? 'Edit Template' : 'New Template'}</h2>
            <label className="block mb-3">
              <span className="block text-sm font-medium mb-1">Title</span>
              <input
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white"
              />
            </label>
            <label className="block mb-4">
              <span className="block text-sm font-medium mb-1">Body</span>
              <textarea
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-y"
              />
              <span className="block text-xs text-muted mt-1 text-right">{editing.body.length} chars</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
