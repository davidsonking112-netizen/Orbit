import { useMemo, useState } from 'react';
import { CalendarDays, Check, Database, FileText, Mail, MessageSquare, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

const services = [
  { name: 'Google Drive', description: 'Search, organize, and work with your files.', category: 'Storage', icon: Database, color: 'drive', connected: true },
  { name: 'Gmail', description: 'Find messages and prepare email drafts.', category: 'Communication', icon: Mail, color: 'gmail', connected: true },
  { name: 'Calendar', description: 'View your schedule and plan around events.', category: 'Productivity', icon: CalendarDays, color: 'calendar', connected: false },
  { name: 'Slack', description: 'Search conversations and draft updates.', category: 'Communication', icon: MessageSquare, color: 'slack', connected: false },
  { name: 'Notion', description: 'Find notes and reference your team wiki.', category: 'Productivity', icon: FileText, color: 'notion', connected: false },
  { name: 'Web search', description: 'Research information from the public web.', category: 'Research', icon: Search, color: 'web', connected: true },
];

export default function IntegrationsPage({ showNotice }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All tools');
  const [connected, setConnected] = useState(() => Object.fromEntries(services.map((s) => [s.name, s.connected])));
  const categories = ['All tools', 'Productivity', 'Communication', 'Storage', 'Research'];
  const visible = useMemo(() => services.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) && (category === 'All tools' || s.category === category)), [query, category]);
  const toggle = (service) => {
    setConnected((all) => ({ ...all, [service]: !all[service] }));
    showNotice(connected[service] ? `${service} disconnected in this demo.` : `${service} connection preview enabled.`);
  };
  return <section className="page-content integrations-page">
    <div className="page-title-row"><div><h1>Integrations</h1><p className="page-subtitle">Connect the tools Orbit can use</p></div><div className="integration-count"><span className="online-dot" /> {Object.values(connected).filter(Boolean).length} connected</div></div>
    <div className="integration-controls"><div className="search-box"><Search size={16} /><input aria-label="Search integrations" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search integrations" />{query && <button onClick={() => setQuery('')}><X size={14} /></button>}</div><div className="category-pills" role="group" aria-label="Filter integrations">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    <div className="integration-grid">{visible.map((service) => { const Icon = service.icon; return <article className="integration-card" key={service.name}><div className="integration-card-top"><span className={`integration-logo ${service.color}`}><Icon size={20} strokeWidth={1.8} /></span><span className="integration-category">{service.category}</span></div><h3>{service.name}</h3><p>{service.description}</p><div className="integration-card-footer"><span className={connected[service.name] ? 'connected-label' : 'available-label'}>{connected[service.name] ? <><Check size={13} /> Connected</> : 'Available'}</span><button className={connected[service.name] ? 'connected-button' : 'connect-button'} onClick={() => toggle(service.name)}>{connected[service.name] ? 'Manage' : 'Connect'}</button></div></article>; })}</div>
    {visible.length === 0 && <div className="empty-state integration-empty"><Search size={22} /><b>No integrations found</b><span>Try a different name or category.</span></div>}
    <div className="integration-security"><span className="security-icon"><Sparkles size={16} /></span><p><b>Built with privacy in mind</b><span>Orbit only uses connected tools when a task needs them. You stay in control of every connection.</span></p><button aria-label="Learn about privacy" onClick={() => showNotice('Connection permissions are managed per service.')}>Learn more <span>→</span></button></div>
  </section>;
}
