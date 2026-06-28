import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Send } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { templatesApi, Template } from '../services/templates';

/**
 * `presetGroupIds` / `presetContactIds` are passed through when the user comes
 * back from ScheduleReview's "Edit Message" link, so we can carry their already-
 * selected recipients forward into SelectRecipients again without losing them.
 */
type ComposeState = {
  presetTitle?: string;
  presetBody?: string;
  presetGroupIds?: string[];
  presetContactIds?: string[];
};

function countSegments(body: string) {
  if (!body) return 1;
  return body.length <= 160 ? 1 : Math.ceil(body.length / 153);
}

export default function Compose() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ComposeState;

  const [tab, setTab] = useState<'custom' | 'templates'>(state.presetTitle ? 'custom' : 'templates');
  const [title, setTitle] = useState(state.presetTitle ?? '');
  const [body, setBody] = useState(state.presetBody ?? '');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    templatesApi.list().then(setTemplates).catch(() => {});
  }, []);

  const filteredTemplates = templates.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()),
  );

  const segments = countSegments(body);

  const handleUseTemplate = (t: Template) => {
    setTitle(t.title);
    setBody(t.body);
    setTab('custom');
  };

  const handleNext = () => {
    if (!title.trim() || !body.trim()) {
      alert('Title and message body are required.');
      return;
    }
    navigate('/compose/recipients', {
      state: {
        title: title.trim(),
        body: body.trim(),
        presetGroupIds: state.presetGroupIds,
        presetContactIds: state.presetContactIds,
      },
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New Message</h1>
      <p className="text-sm text-muted mb-6">Compose a new message or pick from a template.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-bg rounded-lg border border-line w-fit">
        <button
          onClick={() => setTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            tab === 'templates' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            tab === 'custom' ? 'bg-white shadow text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Custom Message
        </button>
      </div>

      {tab === 'templates' ? (
        <>
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white mb-4"
          />
          {filteredTemplates.length === 0 ? (
            <Card className="text-center text-muted text-sm">
              {templates.length === 0 ? 'No templates yet. Create one in Templates.' : 'No matches.'}
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map((t) => (
                <Card key={t.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{t.title}</div>
                    <div className="text-xs text-muted mt-1 line-clamp-2">{t.body}</div>
                  </div>
                  <Button variant="secondary" onClick={() => handleUseTemplate(t)}>Use</Button>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card>
          <label className="block mb-4">
            <span className="block text-sm font-medium mb-1">Title</span>
            <input
              type="text"
              placeholder="Internal title — e.g. Fire Drill 7pm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Message Body</span>
            <textarea
              placeholder="Type your message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-y"
            />
          </label>

          <div className="text-xs text-muted text-right mt-2">
            {body.length} chars · {segments} segment{segments === 1 ? '' : 's'} per recipient
          </div>
        </Card>
      )}

      {/* Bottom CTA */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleNext} disabled={!title.trim() || !body.trim()}>
          <span className="inline-flex items-center gap-2">
            Next · Choose Recipients <Send size={14} />
          </span>
        </Button>
      </div>
    </div>
  );
}
