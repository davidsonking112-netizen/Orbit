import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Database, FileText, KeyRound, Mail, MessageSquare, Search, Sparkles, X } from 'lucide-react';
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

export default function IntegrationsPage({ showNotice }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All tools');
  const [enabled, setEnabled] = usePersistentState('orbit:v1:demo-integrations', initialState);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState({ connected: false });
  const [providerBusy, setProviderBusy] = useState(false);
  const [providerMessage, setProviderMessage] = useState('');
  useEffect(() => { fetch('/api/providers/google-ai-studio').then((response) => response.json()).then(setProvider).catch(() => {}); }, []);
  const visible = useMemo(() => services.filter((service) => service.name.toLowerCase().includes(query.toLowerCase()) && (category === 'All tools' || service.category === category)), [query, category]);
  const count = Object.values(enabled).filter(Boolean).length;

  const toggle = (service) => {
    const nextEnabled = !enabled[service.name];
    setEnabled((all) => ({ ...all, [service.name]: nextEnabled }));
    showNotice(`${service.name} demo state ${nextEnabled ? 'enabled' : 'disabled'} in this browser. No account was connected.`);
  };

  const connectProvider = async (event) => {
    event.preventDefault();
    setProviderBusy(true); setProviderMessage('');
    try {
      const response = await fetch('/api/providers/google-ai-studio/connect', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ apiKey }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connection failed.');
      setProvider(data); setApiKey(''); setProviderMessage(`Connected to ${data.model}. ${data.testReply}`); showNotice('Google AI Studio connected and tested.');
    } catch (error) { setProviderMessage(error.message); }
    finally { setProviderBusy(false); }
  };
  const disconnectProvider = async () => { await fetch('/api/providers/google-ai-studio', { method: 'DELETE' }); setProvider({ connected: false }); setProviderMessage('Key cleared from the Orbit runtime.'); };
  const testProvider = async () => { setProviderBusy(true); setProviderMessage(''); try { const response = await fetch('/api/providers/google-ai-studio/test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'Reply in one short sentence confirming Orbit can call Gemini.' }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Test failed.'); setProviderMessage(data.text); showNotice('Gemini test completed.'); } catch (error) { setProviderMessage(error.message); } finally { setProviderBusy(false); } };

  return <section className="page-content integrations-page">
    <div className="page-title-row"><div><h1>Integrations</h1><p className="page-subtitle">Choose the tools Orbit could use</p></div><div className="integration-count"><span className="online-dot" /> {count} demo-enabled</div></div>
    <div className="demo-banner"><Sparkles size={15} /><span><b>Demo mode:</b> these switches only save a local preference. No external account, permission, or OAuth connection is created.</span></div>
    <div className="integration-controls"><div className="search-box"><Search size={16} /><input aria-label="Search integrations" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search integrations" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</div><div className="category-pills" role="group" aria-label="Filter integrations">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    <section className="provider-card">
      <div className="provider-card-heading"><span className="provider-logo"><KeyRound size={18} /></span><div><h2>Google AI Studio</h2><p>Use your Gemini API key to test Orbit’s real provider connection.</p></div><span className={provider.connected ? 'provider-status connected' : 'provider-status'}>{provider.connected ? 'Connected' : 'Not connected'}</span></div>
      <form className="provider-form" onSubmit={connectProvider}><input aria-label="Google AI Studio API key" type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Paste Google AI Studio API key" /><button className="primary-button" disabled={providerBusy || !apiKey.trim()}>{providerBusy ? 'Testing…' : 'Connect & test'}</button></form>
      <div className="provider-actions"><span>Key is sent only to Orbit’s backend, kept in memory, and never saved to localStorage or Git. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Get a key</a></span>{provider.connected && <div><button type="button" onClick={testProvider} disabled={providerBusy}>Run test</button><button type="button" onClick={disconnectProvider}>Disconnect</button></div>}</div>
      {providerMessage && <div className="provider-message" role="status">{providerMessage}</div>}
    </section>
    <div className="integration-grid">{visible.map((service) => {
      const Icon = service.icon;
      const active = Boolean(enabled[service.name]);
      return <article className="integration-card" key={service.name}>
        <div className="integration-card-top"><span className={`integration-logo ${service.color}`}><Icon size={20} strokeWidth={1.8} /></span><span className="integration-category">{service.category}</span></div>
        <h3>{service.name}</h3><p>{service.description}</p>
        <div className="integration-card-footer"><span className={active ? 'connected-label' : 'available-label'}>{active ? <><Check size={13} /> Demo enabled</> : 'Not enabled'}</span><button className={active ? 'connected-button' : 'connect-button'} aria-pressed={active} onClick={() => toggle(service)}>{active ? 'Disable' : 'Enable demo'}</button></div>
      </article>;
    })}</div>
    {visible.length === 0 && <div className="empty-state integration-empty"><Search size={22} /><b>No integrations found</b><span>Try a different name or category.</span></div>}
    <div className="integration-security"><span className="security-icon"><Sparkles size={16} /></span><p><b>Demo switches stay local</b><span>Only the Google AI Studio connector above calls a real provider. Its key is held in runtime memory for testing and is cleared on disconnect or server restart.</span></p></div>
  </section>;
}
