import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Database, FileText, KeyRound, Mail, MessageSquare, Search, Server, Sparkles, X } from 'lucide-react';
import usePersistentState from '../hooks/usePersistentState.js';

const services = [
  { name: 'Google Drive', description: 'Search, organize, and work with your files.', category: 'Storage', icon: Database, color: 'drive', enabledByDefault: true },
  { name: 'Gmail', description: 'Find messages and prepare email drafts.', category: 'Communication', icon: Mail, color: 'gmail', enabledByDefault: true },
  { name: 'Calendar', description: 'View your schedule and plan around events.', category: 'Productivity', icon: CalendarDays, color: 'calendar', enabledByDefault: false },
  { name: 'Slack', description: 'Search conversations and draft updates.', category: 'Communication', icon: MessageSquare, color: 'slack', enabledByDefault: false },
  { name: 'Notion', description: 'Find notes and reference your team wiki.', category: 'Productivity', icon: FileText, color: 'notion', enabledByDefault: false },
  { name: 'Web search', description: 'Research information from the public web.', category: 'Research', icon: Search, color: 'web', enabledByDefault: true },
];
const categories = ['All tools', 'Productivity', 'Communication', 'Storage', 'Research'];
const initialState = Object.fromEntries(services.map((service) => [service.name, service.enabledByDefault]));

async function request(path, options) {
  const response = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Orbit runtime request failed.');
  return data;
}

export default function IntegrationsPage({ showNotice }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All tools');
  const [enabled, setEnabled] = usePersistentState('orbit:v1:demo-integrations', initialState);
  const [ai, setAi] = useState({ connected: false });
  const [aiKey, setAiKey] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [composio, setComposio] = useState({ connected: false });
  const [composioKey, setComposioKey] = useState('');
  const [composioBusy, setComposioBusy] = useState(false);
  const [composioMessage, setComposioMessage] = useState('');
  const [composioTools, setComposioTools] = useState([]);
  const [supabase, setSupabase] = useState({ connected: false });
  const [supabaseForm, setSupabaseForm] = useState({ url: '', key: '', mode: 'anon' });
  const [supabaseBusy, setSupabaseBusy] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState('');

  useEffect(() => {
    Promise.all([request('/api/providers/google-ai-studio'), request('/api/providers/composio'), request('/api/providers/supabase')])
      .then(([nextAi, nextComposio, nextSupabase]) => { setAi(nextAi); setComposio(nextComposio); setSupabase(nextSupabase); }).catch(() => {});
  }, []);

  const visible = useMemo(() => services.filter((service) => service.name.toLowerCase().includes(query.toLowerCase()) && (category === 'All tools' || service.category === category)), [query, category]);
  const count = Object.values(enabled).filter(Boolean).length;
  const toggle = (service) => {
    const nextEnabled = !enabled[service.name];
    setEnabled((all) => ({ ...all, [service.name]: nextEnabled }));
    showNotice(`${service.name} demo state ${nextEnabled ? 'enabled' : 'disabled'} in this browser. No account was connected.`);
  };

  const connectAi = async (event) => {
    event.preventDefault(); setAiBusy(true); setAiMessage('');
    try { const data = await request('/api/providers/google-ai-studio/connect', { method: 'POST', body: JSON.stringify({ apiKey: aiKey }) }); setAi(data); setAiKey(''); setAiMessage(`Connected to ${data.model}. ${data.testReply}`); showNotice('AI provider connected and tested.'); }
    catch (error) { setAiMessage(error.message); } finally { setAiBusy(false); }
  };
  const disconnectAi = async () => { const data = await request('/api/providers/google-ai-studio', { method: 'DELETE' }); setAi(data); setAiMessage('AI key cleared from runtime memory.'); };
  const testAi = async () => { setAiBusy(true); setAiMessage(''); try { const data = await request('/api/providers/google-ai-studio/test', { method: 'POST', body: JSON.stringify({ prompt: 'Reply in one short sentence confirming Orbit can synthesize a workflow result.' }) }); setAiMessage(data.text); showNotice('AI synthesis test completed.'); } catch (error) { setAiMessage(error.message); } finally { setAiBusy(false); } };

  const connectComposioProvider = async (event) => {
    event.preventDefault(); setComposioBusy(true); setComposioMessage('');
    try { const data = await request('/api/providers/composio/connect', { method: 'POST', body: JSON.stringify({ apiKey: composioKey }) }); setComposio(data); setComposioKey(''); setComposioMessage(`Connected via ${data.mode}.`); showNotice('Composio connected.'); if (data.mode === 'connect-mcp') await loadComposioTools(); }
    catch (error) { setComposioMessage(error.message); } finally { setComposioBusy(false); }
  };
  const loadComposioTools = async () => { try { const data = await request('/api/providers/composio/tools'); setComposioTools(data.tools || []); setComposioMessage(`${data.tools?.length || 0} Composio tools available.`); } catch (error) { setComposioMessage(error.message); } };
  const disconnectComposio = async () => { const data = await request('/api/providers/composio', { method: 'DELETE' }); setComposio(data); setComposioTools([]); setComposioMessage('Composio key cleared from runtime memory.'); };

  const connectSupabaseProvider = async (event) => {
    event.preventDefault(); setSupabaseBusy(true); setSupabaseMessage('');
    try { const data = await request('/api/providers/supabase/connect', { method: 'POST', body: JSON.stringify(supabaseForm) }); setSupabase(data); setSupabaseForm((form) => ({ ...form, key: '' })); setSupabaseMessage(`Connected to ${data.url}. Run persistence is enabled when the orbit_runs table exists.`); showNotice('Supabase connected and tested.'); }
    catch (error) { setSupabaseMessage(error.message); } finally { setSupabaseBusy(false); }
  };
  const testSupabaseProvider = async () => { setSupabaseBusy(true); setSupabaseMessage(''); try { await request('/api/providers/supabase/test', { method: 'POST' }); setSupabaseMessage('Supabase connection is healthy.'); showNotice('Supabase test completed.'); } catch (error) { setSupabaseMessage(error.message); } finally { setSupabaseBusy(false); } };
  const disconnectSupabase = async () => { const data = await request('/api/providers/supabase', { method: 'DELETE' }); setSupabase(data); setSupabaseMessage('Supabase credentials cleared from runtime memory.'); };

  return <section className="page-content integrations-page">
    <div className="page-title-row"><div><h1>Integrations</h1><p className="page-subtitle">Connect AI, tools, and durable run storage to Orbit</p></div><div className="integration-count"><span className="online-dot" /> {count} demo-enabled</div></div>
    <div className="demo-banner"><Sparkles size={15} /><span><b>Runtime connections:</b> keys are tested by the Orbit server and held in memory only. Demo switches below do not connect external accounts.</span></div>
    <div className="integration-controls"><div className="search-box"><Search size={16} /><input aria-label="Search integrations" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search integrations" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</div><div className="category-pills" role="group" aria-label="Filter integrations">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    <RuntimeCard title="Google AI Studio" description="Gemini synthesizes tool results into concise, evidence-grounded workflow summaries." connected={ai.connected} icon={KeyRound} message={aiMessage} onDisconnect={disconnectAi} onTest={testAi} busy={aiBusy}>
      <form className="provider-form" onSubmit={connectAi}><input aria-label="Google AI Studio API key" type="password" autoComplete="off" value={aiKey} onChange={(event) => setAiKey(event.target.value)} placeholder="Paste Google AI Studio API key" /><button className="primary-button" disabled={aiBusy || !aiKey.trim()}>{aiBusy ? 'Testing…' : 'Connect & test'}</button></form>
      <small className="provider-help">Uses Gemini 2.5 Flash. The key is never stored in the browser or repository.</small>
    </RuntimeCard>
    <RuntimeCard title="Composio" description="Discover and execute connected app tools through Composio MCP." connected={composio.connected} icon={Sparkles} message={composioMessage} onDisconnect={disconnectComposio} onTest={composio.mode === 'connect-mcp' ? loadComposioTools : undefined} busy={composioBusy}>
      <form className="provider-form" onSubmit={connectComposioProvider}><input aria-label="Composio API key" type="password" autoComplete="off" value={composioKey} onChange={(event) => setComposioKey(event.target.value)} placeholder="ck_… consumer key or ak_… project key" /><button className="primary-button" disabled={composioBusy || !composioKey.trim()}>{composioBusy ? 'Connecting…' : 'Connect & test'}</button></form>
      <small className="provider-help">Consumer keys enable MCP tool discovery and calls. Project keys connect in REST mode.</small>
      {composioTools.length > 0 && <div className="provider-tool-count"><Check size={13} /> {composioTools.length} tools discovered</div>}
    </RuntimeCard>
    <RuntimeCard title="Supabase" description="Persist completed Orbit runs in the orbit_runs table with a server-side REST connection." connected={supabase.connected} icon={Server} message={supabaseMessage} onDisconnect={disconnectSupabase} onTest={testSupabaseProvider} busy={supabaseBusy}>
      <form className="provider-form supabase-form" onSubmit={connectSupabaseProvider}><input aria-label="Supabase project URL" type="url" value={supabaseForm.url} onChange={(event) => setSupabaseForm((form) => ({ ...form, url: event.target.value }))} placeholder="https://your-project.supabase.co" /><input aria-label="Supabase API key" type="password" autoComplete="off" value={supabaseForm.key} onChange={(event) => setSupabaseForm((form) => ({ ...form, key: event.target.value }))} placeholder="Supabase anon or service-role key" /><select aria-label="Supabase key type" value={supabaseForm.mode} onChange={(event) => setSupabaseForm((form) => ({ ...form, mode: event.target.value }))}><option value="anon">Anon key</option><option value="service_role">Service role key</option></select><button className="primary-button" disabled={supabaseBusy || !supabaseForm.url.trim() || !supabaseForm.key.trim()}>{supabaseBusy ? 'Testing…' : 'Connect & test'}</button></form>
      <small className="provider-help">Run the included <code>supabase/schema.sql</code> in Supabase SQL Editor to enable run persistence.</small>
    </RuntimeCard>
    <div className="integration-grid">{visible.map((service) => { const Icon = service.icon; const active = Boolean(enabled[service.name]); return <article className="integration-card" key={service.name}><div className="integration-card-top"><span className={`integration-logo ${service.color}`}><Icon size={20} strokeWidth={1.8} /></span><span className="integration-category">{service.category}</span></div><h3>{service.name}</h3><p>{service.description}</p><div className="integration-card-footer"><span className={active ? 'connected-label' : 'available-label'}>{active ? <><Check size={13} /> Demo enabled</> : 'Not enabled'}</span><button className={active ? 'connected-button' : 'connect-button'} aria-pressed={active} onClick={() => toggle(service)}>{active ? 'Disable' : 'Enable demo'}</button></div></article>; })}</div>
    {visible.length === 0 && <div className="empty-state integration-empty"><Search size={22} /><b>No integrations found</b><span>Try a different name or category.</span></div>}
    <div className="integration-security"><span className="security-icon"><Sparkles size={16} /></span><p><b>Connected architecture</b><span>Orbit runs tools on the server, optionally asks Gemini to synthesize evidence, and optionally persists run records to Supabase. No provider is contacted until you connect it.</span></p></div>
  </section>;
}

function RuntimeCard({ title, description, connected, icon: Icon, message, onDisconnect, onTest, busy, children }) {
  return <section className="provider-card runtime-provider-card"><div className="provider-card-heading"><span className="provider-logo"><Icon size={18} /></span><div><h2>{title}</h2><p>{description}</p></div><span className={connected ? 'provider-status connected' : 'provider-status'}>{connected ? 'Connected' : 'Not connected'}</span></div>{children}<div className="provider-actions"><span>Runtime memory only · no browser or Git storage.</span>{connected && <div>{onTest && <button type="button" onClick={onTest} disabled={busy}>{busy ? 'Testing…' : 'Run test'}</button>}<button type="button" onClick={onDisconnect}>Disconnect</button></div>}</div>{message && <div className="provider-message" role="status">{message}</div>}</section>;
}
