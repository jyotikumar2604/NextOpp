import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Database, RefreshCw, Upload, CheckCircle2, AlertCircle, Clock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  active: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active', icon: CheckCircle2 },
  manual: { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Manual Import', icon: Upload },
  coming_soon: { badge: 'bg-charcoal-100 text-charcoal-500 border-charcoal-200', label: 'Coming Soon', icon: Clock },
  unavailable: { badge: 'bg-red-50 text-red-700 border-red-200', label: 'Unavailable', icon: AlertCircle },
};

export default function AdminIngestionPage() {
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [batchJson, setBatchJson] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [result, setResult] = useState(null);
  const [jsonError, setJsonError] = useState('');
  const [expandedSource, setExpandedSource] = useState(null);

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    setLoadingSources(true);
    try {
      const data = await adminAPI.getIngestionSources();
      setSources(data.sources || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load ingestion sources');
    } finally {
      setLoadingSources(false);
    }
  }

  function validateJson(text) {
    setJsonError('');
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setJsonError('JSON must be an array of opportunity objects.');
        return null;
      }
      return parsed;
    } catch (e) {
      setJsonError('Invalid JSON: ' + e.message);
      return null;
    }
  }

  async function handleIngest() {
    if (!batchJson.trim()) { toast.error('Paste JSON data first'); return; }
    const parsed = validateJson(batchJson);
    if (!parsed) return;

    setIngesting(true);
    setResult(null);
    try {
      const data = await adminAPI.ingestBatch({ opportunities: parsed });
      setResult(data.result || data);
      toast.success(`Ingestion complete: ${data.result?.imported ?? 0} imported`);
    } catch (err) {
      toast.error(err.message || 'Ingestion failed');
    } finally {
      setIngesting(false);
    }
  }

  const EXAMPLE = JSON.stringify([
    {
      title: 'Example Internship',
      organization: 'Example Corp',
      category: 'internship',
      description: 'A sample internship opportunity.',
      deadline: '2025-06-30',
      applicationUrl: 'https://example.com/apply',
      requiredSkills: ['python', 'machine learning'],
      location: 'Bangalore',
      workMode: 'hybrid',
      sourceName: 'NextOpp Curated',
      verificationStatus: 'demonstration',
    },
  ], null, 2);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Database className="w-6 h-6 text-charcoal-600" />
            <h1 className="font-serif text-2xl text-charcoal-900">Opportunity Ingestion</h1>
          </div>
          <p className="text-charcoal-500 text-sm">
            Manage how opportunities enter the NextOpp platform. Real-time API integrations require external partnerships.
            Use JSON batch import for manual or curated listings.
          </p>
        </div>

        {/* Source status table */}
        <div className="bg-white rounded-xl border border-[#E8E3D8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8E3D8] flex items-center justify-between">
            <h2 className="font-semibold text-charcoal-900">Supported Sources</h2>
            <button
              onClick={fetchSources}
              disabled={loadingSources}
              className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSources ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingSources ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-14 bg-charcoal-100 rounded-lg" />
              ))}
            </div>
          ) : sources.length === 0 ? (
            <div className="p-8 text-center text-charcoal-400">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No sources loaded</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E3D8]">
              {sources.map((source) => {
                const meta = STATUS_STYLES[source.status] || STATUS_STYLES.unavailable;
                const StatusIcon = meta.icon;
                const isExpanded = expandedSource === source.id;

                return (
                  <div key={source.id}>
                    <button
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-charcoal-50/50 transition-colors text-left"
                      onClick={() => setExpandedSource(isExpanded ? null : source.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-charcoal-800 text-sm">{source.name}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs border font-medium ${meta.badge}`}>
                              <StatusIcon className="w-3 h-3" />
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-400 mt-0.5">{source.description}</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-charcoal-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-charcoal-400 flex-shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 bg-charcoal-50/50">
                        <div className="rounded-lg border border-[#E8E3D8] bg-white p-4 space-y-2 text-sm">
                          {source.apiStatus && (
                            <div className="flex gap-2">
                              <span className="text-charcoal-500 w-28 flex-shrink-0">API Status:</span>
                              <span className="text-charcoal-700">{source.apiStatus}</span>
                            </div>
                          )}
                          {source.integrationNote && (
                            <div className="flex gap-2">
                              <span className="text-charcoal-500 w-28 flex-shrink-0">Integration:</span>
                              <span className="text-charcoal-700">{source.integrationNote}</span>
                            </div>
                          )}
                          {source.url && (
                            <div className="flex gap-2">
                              <span className="text-charcoal-500 w-28 flex-shrink-0">Website:</span>
                              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-rust-600 hover:text-rust-700 underline underline-offset-2 truncate">{source.url}</a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Batch import */}
        <div className="bg-white rounded-xl border border-[#E8E3D8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8E3D8]">
            <h2 className="font-semibold text-charcoal-900">JSON Batch Import</h2>
            <p className="text-xs text-charcoal-400 mt-0.5">Paste a JSON array of opportunity objects. Duplicates are skipped automatically.</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Info box */}
            <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Required fields:</p>
                <p className="text-xs mt-0.5">
                  <code className="font-mono bg-amber-100 px-1 rounded">title</code>,{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">organization</code>,{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">category</code> (internship, job, scholarship, hackathon, fellowship, research, competition),{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">sourceName</code>
                </p>
              </div>
            </div>

            {/* Example */}
            <details className="text-sm">
              <summary className="cursor-pointer text-charcoal-500 hover:text-charcoal-700 font-medium">View example JSON</summary>
              <pre className="mt-2 p-4 bg-charcoal-900 text-cream-100 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed">
                {EXAMPLE}
              </pre>
            </details>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal-700">Opportunities JSON</label>
              <textarea
                rows={12}
                placeholder={`[\n  {\n    "title": "...",\n    "organization": "...",\n    "category": "internship",\n    "sourceName": "NextOpp Curated"\n  }\n]`}
                className={`w-full px-4 py-3 rounded-lg border font-mono text-xs text-charcoal-900 bg-white focus:outline-none focus:ring-2 focus:ring-rust-600/20 resize-none ${
                  jsonError ? 'border-red-400' : 'border-[#E8E3D8] focus:border-rust-600'
                }`}
                value={batchJson}
                onChange={(e) => {
                  setBatchJson(e.target.value);
                  if (e.target.value.trim()) validateJson(e.target.value);
                  else setJsonError('');
                }}
              />
              {jsonError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {jsonError}
                </p>
              )}
            </div>

            <button
              onClick={handleIngest}
              disabled={ingesting || !!jsonError || !batchJson.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-900 text-white rounded-lg text-sm font-medium hover:bg-charcoal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {ingesting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Importing…</>
              ) : (
                <><Upload className="w-4 h-4" /> Import Opportunities</>
              )}
            </button>

            {/* Result */}
            {result && (
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { label: 'Imported', value: result.imported ?? 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { label: 'Updated', value: result.updated ?? 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { label: 'Skipped', value: result.skipped ?? 0, color: 'text-charcoal-600 bg-charcoal-100 border-charcoal-200' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`p-3 rounded-lg border text-center ${color}`}>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs font-medium mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
            {result?.errors?.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-medium text-red-700 mb-1">Errors ({result.errors.length})</p>
                <ul className="space-y-1">
                  {result.errors.slice(0, 5).map((e, i) => (
                    <li key={i} className="text-xs text-red-600">· {typeof e === 'string' ? e : e.message || JSON.stringify(e)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

