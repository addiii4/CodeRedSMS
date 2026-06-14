import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { ChevronLeft, Upload, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { contactsApi, BulkImportRow, BulkImportResult } from '../services/contacts';

const SAMPLE_ROWS: BulkImportRow[] = [
  { fullName: 'Test User One', phoneE164: '+61400000001', groupNames: ['Demo'] },
  { fullName: 'Test User Two', phoneE164: '+61400000002', groupNames: ['Demo'] },
  { fullName: 'Test User Three', phoneE164: '+61400000003' },
];

/** Normalise any column name to a known canonical key. */
function mapHeader(h: string): 'fullName' | 'phoneE164' | 'groups' | null {
  const k = h.toLowerCase().trim().replace(/[_\s-]/g, '');
  if (['fullname', 'name'].includes(k)) return 'fullName';
  if (['phone', 'phonenumber', 'phonee164', 'mobile'].includes(k)) return 'phoneE164';
  if (['group', 'groups', 'groupname', 'groupnames'].includes(k)) return 'groups';
  return null;
}

function normalisePhone(raw: string): string {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('0')) return '+61' + cleaned.slice(1);   // AU default
  return cleaned;
}

export default function ContactImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [filename, setFilename] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const handleFile = (file: File) => {
    setFilename(file.name);
    setResult(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const out: BulkImportRow[] = [];
        for (const raw of parsed.data as Record<string, string>[]) {
          const norm: { fullName?: string; phoneE164?: string; groupNames?: string[] } = {};
          for (const [k, v] of Object.entries(raw)) {
            const canonical = mapHeader(k);
            if (!canonical || !v) continue;
            if (canonical === 'groups') norm.groupNames = v.split(/[,;|]/).map((g) => g.trim()).filter(Boolean);
            else if (canonical === 'phoneE164') norm.phoneE164 = normalisePhone(v);
            else norm[canonical] = v.trim();
          }
          if (norm.fullName && norm.phoneE164) out.push(norm as BulkImportRow);
        }
        setRows(out);
      },
    });
  };

  const useSample = () => {
    setRows(SAMPLE_ROWS);
    setFilename('sample-data.csv');
    setResult(null);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const res = await contactsApi.bulkImport(rows);
      setResult(res);
    } catch (e: any) {
      alert('Import failed: ' + (e?.message || 'Try again.'));
    } finally { setImporting(false); }
  };

  if (result) {
    return (
      <div>
        <button onClick={() => navigate('/contacts')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
          <ChevronLeft size={16} /> Back to Contacts
        </button>
        <Card className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 grid place-items-center mx-auto mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-1">Import Complete</h2>
          <p className="text-sm text-muted mb-4">
            {result.imported} imported · {result.skipped} skipped
          </p>
          {result.errors.length > 0 && (
            <details className="text-left text-sm mt-4">
              <summary className="cursor-pointer text-muted">{result.errors.length} error{result.errors.length === 1 ? '' : 's'}</summary>
              <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                {result.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
          <Button onClick={() => navigate('/contacts')} className="mt-4">Done</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/contacts')} className="text-muted hover:text-ink flex items-center gap-1 mb-4">
        <ChevronLeft size={16} /> Back to Contacts
      </button>
      <h1 className="text-2xl font-bold mb-1">Import Contacts</h1>
      <p className="text-sm text-muted mb-6">Upload a CSV with <code className="bg-bg px-1.5 py-0.5 rounded">fullName</code>, <code className="bg-bg px-1.5 py-0.5 rounded">phoneE164</code>, and optionally <code className="bg-bg px-1.5 py-0.5 rounded">groups</code> (comma-separated).</p>

      {/* Format card */}
      <Card className="mb-4 bg-amber-50 border-amber-200">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2">Expected format</div>
        <pre className="text-xs bg-white border border-amber-200 rounded p-3 overflow-x-auto">
fullName,phoneE164,groups
Alice Smith,+61400000001,Staff;Emergency
Bob Brown,0400000002,Staff
        </pre>
      </Card>

      {/* Upload */}
      <Card className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 border-2 border-dashed border-line rounded-xl text-center hover:border-primary hover:bg-bg transition"
        >
          <Upload size={28} className="mx-auto mb-2 text-muted" />
          <div className="font-semibold">Click to upload CSV</div>
          <div className="text-xs text-muted mt-1">{filename || 'No file selected'}</div>
        </button>
        <div className="text-center mt-3">
          <button onClick={useSample} className="text-sm text-primary font-semibold">Use sample data (for testing)</button>
        </div>
      </Card>

      {rows.length > 0 && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-primary" />
            <span className="text-sm font-semibold">{rows.length} contact{rows.length === 1 ? '' : 's'} ready to import</span>
          </div>
          <div className="border border-line rounded-lg overflow-hidden max-h-60 overflow-y-auto">
            {rows.slice(0, 10).map((r, i) => (
              <div key={i} className="px-3 py-2 border-b border-line last:border-b-0 text-xs flex items-center gap-3">
                <span className="font-semibold">{r.fullName}</span>
                <span className="text-muted">{r.phoneE164}</span>
                {r.groupNames && r.groupNames.length > 0 && (
                  <span className="text-muted ml-auto">→ {r.groupNames.join(', ')}</span>
                )}
              </div>
            ))}
            {rows.length > 10 && <div className="px-3 py-2 text-xs text-muted">…and {rows.length - 10} more</div>}
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleImport} disabled={rows.length === 0} loading={importing}>
          Import {rows.length} Contact{rows.length === 1 ? '' : 's'}
        </Button>
      </div>
    </div>
  );
}
