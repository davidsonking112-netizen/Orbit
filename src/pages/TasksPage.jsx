import { useState } from 'react';
import { CalendarDays, Check, ChevronRight, Clock3, FileText, Mail, MoreHorizontal, Plus, Search, Sparkles, ToggleLeft } from 'lucide-react';

const initialSchedules = [
  { title: 'Weekly research digest', cadence: 'Every Monday, 9:00 AM', next: 'Next: Apr 28, 2025', icon: FileText, tint: 'mint' },
  { title: 'Friday inbox summary', cadence: 'Every Friday, 4:00 PM', next: 'Next: Apr 25, 2025', icon: Mail, tint: 'lavender' },
  { title: 'Monthly project check-in', cadence: 'First day of month, 10:00 AM', next: 'Next: May 1, 2025', icon: CalendarDays, tint: 'purple' },
];

export default function TasksPage({ navigate }) {
  const [schedules, setSchedules] = useState(initialSchedules.map((item) => ({ ...item, enabled: true })));
  const [autoEnabled, setAutoEnabled] = useState([true, false, true]);
  const [modal, setModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const toggle = (index) => setSchedules((all) => all.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item));
  const toggleAuto = (index) => setAutoEnabled((all) => all.map((item, i) => i === index ? !item : item));
  const createSchedule = (e) => {
    e.preventDefault();
    if (!scheduleName.trim()) return;
    setSchedules((all) => [...all, { title: scheduleName.trim(), cadence: 'Schedule details to be configured', next: 'Draft schedule', icon: CalendarDays, tint: 'mint', enabled: true }]);
    setScheduleName(''); setModal(false);
  };
  return <div className="split-page task-page">
    <section className="page-content task-content">
      <div className="page-title-row"><div><h1>Schedules &amp; automations</h1><p className="page-subtitle">Set up work Orbit can run for you</p></div><button className="primary-button" onClick={() => setModal(true)}><Plus size={16} /> Create schedule</button></div>
      <div className="schedule-grid">
        {schedules.map((item, i) => { const Icon = item.icon; return <article className="schedule-card" key={`${item.title}-${i}`}>
          <div className={`tile-icon ${item.tint}`}><Icon size={18} /></div>
          <div className="schedule-copy"><h3>{item.title}</h3><p>{item.cadence}</p><span className="next-run">{item.next}</span></div>
          <div className="schedule-controls"><button className={`switch ${item.enabled ? 'on' : ''}`} aria-label={`Toggle ${item.title}`} onClick={() => toggle(i)}><span /></button><button className="dots-button" aria-label="More options"><MoreHorizontal size={18} /></button></div>
        </article>; })}
      </div>
      <div className="section-heading-row automation-heading"><div><h2>Automations</h2><p>Triggered actions that run automatically</p></div><button className="secondary-dark-button" onClick={() => setModal(true)}><Plus size={15} /> Add automation</button></div>
      <div className="automation-list">
        <AutomationRow text="When a file is added" action="summarize it" enabled={autoEnabled[0]} onClick={() => toggleAuto(0)} />
        <AutomationRow text="When a meeting ends" action="draft follow-up notes" enabled={autoEnabled[1]} onClick={() => toggleAuto(1)} />
        <AutomationRow text="Every Friday afternoon" action="prepare a weekly recap" enabled={autoEnabled[2]} onClick={() => toggleAuto(2)} />
      </div>
      {modal && <div className="modal-backdrop" onClick={() => setModal(false)}><form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={createSchedule}><button type="button" className="modal-close" onClick={() => setModal(false)}>×</button><div className="modal-icon"><CalendarDays size={20} /></div><h2>Create a schedule</h2><p>Name the recurring task you want Orbit to run.</p><label htmlFor="schedule-name">Schedule name</label><input id="schedule-name" autoFocus value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} placeholder="e.g. Monday team update" /><button className="primary-button modal-submit" type="submit">Continue</button></form></div>}
    </section>
    <aside className="inspector task-inspector"><div className="inspector-title"><h2>Workspace &amp; automations</h2><button className="dots-button"><MoreHorizontal size={18} /></button></div>
      <button className="active-task-card" onClick={() => navigate('/task/compare')}><div className="active-task-top"><span className="online-dot" /><div><b>Comparing project tools</b><small>Analysis · 3 sources</small></div></div><span className="review-chip"><span className="mail-mini">▱</span> Review before sending <ChevronRight size={14} /></span><div className="progress-list"><ProgressStep state="done" text="Understanding request" /><ProgressStep state="active" text="Searching sources" /><ProgressStep text="Preparing summary" /><ProgressStep text="Extracting key findings" /><ProgressStep text="Drafting comparison" /><ProgressStep text="Finalizing summary" /></div></button>
      <div className="member-card"><span className="avatar">JD</span><span><b>Jordan Diaz</b><small>Workspace member</small></span><span className="online-dot" /></div>
      <div className="activity-empty"><span className="activity-file"><FileText size={16} /></span><span>No scheduled activity</span><small>Just now</small></div>
    </aside>
  </div>;
}

function AutomationRow({ text, action, enabled, onClick }) {
  return <div className="automation-row"><div className="automation-flow"><span>{text}</span><ChevronRight size={14} /><b>{action}</b></div><div className="automation-state"><button className={`switch ${enabled ? 'on' : ''}`} aria-label={`Toggle automation: ${text}`} onClick={onClick}><span /></button><small>{enabled ? 'Enabled' : 'Paused'}</small></div></div>;
}

function ProgressStep({ state = '', text }) {
  return <div className={`progress-step ${state}`}><span className="step-marker">{state === 'done' ? <Check size={12} /> : null}</span><span>{text}</span></div>;
}
