import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, Search, Users, User } from 'lucide-react';
import Button from '../components/Button';
import { groupsApi, Group } from '../services/groups';
import { contactsApi, Contact } from '../services/contacts';

type LocationState = {
  title: string;
  body: string;
  presetGroupIds?: string[];
  presetContactIds?: string[];
};

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className={`w-5 h-5 rounded-full border-2 grid place-items-center transition shrink-0 ${
      checked ? 'border-primary bg-primary' : 'border-line bg-white'
    }`}>
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
    </div>
  );
}

export default function SelectRecipients() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.title) return <Navigate to="/compose" replace />;

  const [groups, setGroups]     = useState<Group[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  // Pre-fill from "Edit Message" round-trip so users don't lose their selection.
  const [selectedGroupIds, setSelectedGroupIds]     = useState<Set<string>>(new Set(state.presetGroupIds ?? []));
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set(state.presetContactIds ?? []));
  const [search, setSearch] = useState('');

  useEffect(() => {
    groupsApi.list().then(setGroups).catch(() => {});
    contactsApi.list().then(setContacts).catch(() => {});
  }, []);

  const q = search.toLowerCase();
  const filteredGroups   = groups.filter((g) => !q || g.name.toLowerCase().includes(q));
  const filteredContacts = contacts.filter((c) =>
    !q || c.fullName.toLowerCase().includes(q) || c.phoneE164.includes(search),
  );

  const totalSelected = selectedGroupIds.size + selectedContactIds.size;

  const toggleGroup   = (id: string) => {
    setSelectedGroupIds((s) => { const next = new Set(s); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleContact = (id: string) => {
    setSelectedContactIds((s) => { const next = new Set(s); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const handleNext = () => {
    if (totalSelected === 0) {
      alert('Select at least one group or contact.');
      return;
    }
    navigate('/compose/review', {
      state: {
        ...state,
        groupIds: Array.from(selectedGroupIds),
        contactIds: Array.from(selectedContactIds),
      },
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-ink"><ChevronLeft size={20} /></button>
        <h1 className="text-2xl font-bold">Choose Recipients</h1>
      </div>
      <p className="text-sm text-muted mb-6">Pick groups, individual contacts, or both.</p>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search groups or contacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-sm bg-white"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Groups */}
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
            <Users size={14} /> Groups
          </h2>
          {filteredGroups.length === 0 ? (
            <div className="bg-white border border-line rounded-xl p-4 text-sm text-muted text-center">
              {groups.length === 0 ? 'No groups yet.' : 'No matches.'}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {filteredGroups.map((g) => {
                const checked = selectedGroupIds.has(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGroup(g.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left border-b border-line last:border-b-0 hover:bg-bg transition ${
                      checked ? 'bg-primary/5' : ''
                    }`}
                  >
                    <Checkbox checked={checked} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{g.name}</div>
                      <div className="text-xs text-muted">{(g.members?.length ?? 0)} member{(g.members?.length ?? 0) === 1 ? '' : 's'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
            <User size={14} /> Individual Contacts
          </h2>
          {filteredContacts.length === 0 ? (
            <div className="bg-white border border-line rounded-xl p-4 text-sm text-muted text-center">
              {contacts.length === 0 ? 'No contacts yet.' : 'No matches.'}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {filteredContacts.map((c) => {
                const checked = selectedContactIds.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left border-b border-line last:border-b-0 hover:bg-bg transition ${
                      checked ? 'bg-primary/5' : ''
                    }`}
                  >
                    <Checkbox checked={checked} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{c.fullName}</div>
                      <div className="text-xs text-muted">{c.phoneE164}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-muted">
          {totalSelected > 0 ? `${totalSelected} selected` : 'Nothing selected'}
        </div>
        <Button onClick={handleNext} disabled={totalSelected === 0}>
          Next · Schedule
        </Button>
      </div>
    </div>
  );
}
