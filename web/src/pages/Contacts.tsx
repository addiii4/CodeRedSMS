import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User, Users as UsersIcon, Upload, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { contactsApi, Contact } from '../services/contacts';
import { groupsApi, Group } from '../services/groups';

type EditContactState = { id?: string; fullName: string; phoneE164: string } | null;
type EditGroupState   = { id?: string; name: string; description: string } | null;

type Tab = 'contacts' | 'groups';

export default function Contacts() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups]     = useState<Group[]>([]);
  const [search, setSearch]     = useState('');
  const [editContact, setEditContact] = useState<EditContactState>(null);
  const [editGroup, setEditGroup]     = useState<EditGroupState>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    contactsApi.list().then(setContacts).catch(() => {});
    groupsApi.list().then(setGroups).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const q = search.toLowerCase();
  const filteredContacts = contacts.filter((c) =>
    !q || c.fullName.toLowerCase().includes(q) || c.phoneE164.includes(search),
  );
  const filteredGroups = groups.filter((g) => !q || g.name.toLowerCase().includes(q));

  /* ── Contact actions ─────────────────────────────────────── */
  const saveContact = async () => {
    if (!editContact) return;
    if (!editContact.fullName.trim() || !editContact.phoneE164.trim()) {
      alert('Name and phone required.'); return;
    }
    setSaving(true);
    try {
      if (editContact.id) {
        await contactsApi.update(editContact.id, {
          fullName: editContact.fullName.trim(),
          phoneE164: editContact.phoneE164.trim(),
        });
      } else {
        await contactsApi.create({
          fullName: editContact.fullName.trim(),
          phoneE164: editContact.phoneE164.trim(),
        });
      }
      setEditContact(null);
      load();
    } catch (e: any) { alert('Save failed: ' + (e?.message || 'Try again.')); }
    finally { setSaving(false); }
  };

  const deleteContact = async (c: Contact) => {
    if (!confirm(`Delete contact "${c.fullName}"?`)) return;
    try { await contactsApi.remove(c.id); load(); }
    catch (e: any) { alert('Delete failed: ' + (e?.message || 'Try again.')); }
  };

  /* ── Group actions ───────────────────────────────────────── */
  const saveGroup = async () => {
    if (!editGroup) return;
    if (!editGroup.name.trim()) { alert('Name required.'); return; }
    setSaving(true);
    try {
      if (editGroup.id) {
        await groupsApi.update(editGroup.id, {
          name: editGroup.name.trim(),
          description: editGroup.description.trim() || undefined,
        });
      } else {
        await groupsApi.create({
          name: editGroup.name.trim(),
          description: editGroup.description.trim() || undefined,
        });
      }
      setEditGroup(null);
      load();
    } catch (e: any) { alert('Save failed: ' + (e?.message || 'Try again.')); }
    finally { setSaving(false); }
  };

  const deleteGroup = async (g: Group) => {
    if (!confirm(`Delete group "${g.name}"?`)) return;
    try { await groupsApi.remove(g.id); load(); }
    catch (e: any) { alert('Delete failed: ' + (e?.message || 'Try again.')); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted">Manage who receives your messages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/contacts/import')}>
            <span className="inline-flex items-center gap-2"><Upload size={14} /> Import CSV</span>
          </Button>
          {tab === 'contacts' ? (
            <Button onClick={() => setEditContact({ fullName: '', phoneE164: '' })}>
              <span className="inline-flex items-center gap-2"><Plus size={14} /> New Contact</span>
            </Button>
          ) : (
            <Button onClick={() => setEditGroup({ name: '', description: '' })}>
              <span className="inline-flex items-center gap-2"><Plus size={14} /> New Group</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-bg rounded-lg border border-line w-fit">
        <button
          onClick={() => setTab('contacts')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            tab === 'contacts' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Contacts ({contacts.length})
        </button>
        <button
          onClick={() => setTab('groups')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            tab === 'groups' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Groups ({groups.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={tab === 'contacts' ? 'Search contacts…' : 'Search groups…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-sm bg-white"
        />
      </div>

      {/* Contacts list */}
      {tab === 'contacts' ? (
        filteredContacts.length === 0 ? (
          <Card className="text-center text-muted text-sm py-10">
            {contacts.length === 0 ? 'No contacts yet.' : 'No matches.'}
          </Card>
        ) : (
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            {filteredContacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0 hover:bg-bg">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{c.fullName}</div>
                  <div className="text-xs text-muted">{c.phoneE164}</div>
                </div>
                <button onClick={() => setEditContact({ id: c.id, fullName: c.fullName, phoneE164: c.phoneE164 })} className="text-muted hover:text-ink p-1"><Edit2 size={16} /></button>
                <button onClick={() => deleteContact(c)} className="text-muted hover:text-red-600 p-1"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredGroups.length === 0 ? (
          <Card className="text-center text-muted text-sm py-10">
            {groups.length === 0 ? 'No groups yet.' : 'No matches.'}
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {filteredGroups.map((g) => (
              <Card key={g.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <UsersIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{g.name}</div>
                  <div className="text-xs text-muted">{(g.members?.length ?? 0)} member{(g.members?.length ?? 0) === 1 ? '' : 's'}</div>
                  {g.description && <p className="text-xs text-muted mt-1 line-clamp-2">{g.description}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditGroup({ id: g.id, name: g.name, description: g.description ?? '' })} className="text-muted hover:text-ink"><Edit2 size={16} /></button>
                    <button onClick={() => deleteGroup(g)} className="text-muted hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Edit Contact modal */}
      {editContact && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center px-4 z-50" onClick={() => setEditContact(null)}>
          <div className="bg-white rounded-2xl border border-line shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editContact.id ? 'Edit Contact' : 'New Contact'}</h2>
            <label className="block mb-3">
              <span className="block text-sm font-medium mb-1">Full Name</span>
              <input type="text" value={editContact.fullName} onChange={(e) => setEditContact({ ...editContact, fullName: e.target.value })} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white" />
            </label>
            <label className="block mb-4">
              <span className="block text-sm font-medium mb-1">Phone (E.164 format)</span>
              <input type="tel" placeholder="+61400000000" value={editContact.phoneE164} onChange={(e) => setEditContact({ ...editContact, phoneE164: e.target.value })} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white" />
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditContact(null)}>Cancel</Button>
              <Button onClick={saveContact} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group modal */}
      {editGroup && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center px-4 z-50" onClick={() => setEditGroup(null)}>
          <div className="bg-white rounded-2xl border border-line shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editGroup.id ? 'Edit Group' : 'New Group'}</h2>
            <label className="block mb-3">
              <span className="block text-sm font-medium mb-1">Name</span>
              <input type="text" value={editGroup.name} onChange={(e) => setEditGroup({ ...editGroup, name: e.target.value })} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white" />
            </label>
            <label className="block mb-4">
              <span className="block text-sm font-medium mb-1">Description <span className="text-muted">(optional)</span></span>
              <textarea rows={3} value={editGroup.description} onChange={(e) => setEditGroup({ ...editGroup, description: e.target.value })} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-y" />
            </label>
            <p className="text-xs text-muted mb-4">Tip: add members later via CSV import or by editing the group.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditGroup(null)}>Cancel</Button>
              <Button onClick={saveGroup} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
