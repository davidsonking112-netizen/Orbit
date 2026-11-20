import { useState } from 'react';
import {
  CalendarDays, Check, ChevronRight, Clock3, FileText, Mail, MoreHorizontal,
  Plus, Trash2, X,
} from 'lucide-react';
import usePersistentState from '../hooks/usePersistentState.js';
import AgentWorkbenchPage from './AgentWorkbenchPage.jsx';

const initialSchedules = [
  { id: 'weekly-research', title: 'Weekly research digest', frequency: 'weekly', time: '09:00', day: 'Monday', icon: 'file', enabled: true },
  { id: 'friday-inbox', title: 'Friday inbox summary', frequency: 'weekly', time: '16:00', day: 'Friday', icon: 'mail', enabled: true },
  { id: 'monthly-checkin', title: 'Monthly project check-in', frequency: 'monthly', time: '10:00', monthDay: 1, icon: 'calendar', enabled: true },
];

const initialAutomations = [
  { id: 'file-added', trigger: 'When a file is added', action: 'summarize it', enabled: true },
  { id: 'meeting-ended', trigger: 'When a meeting ends', action: 'draft follow-up notes', enabled: false },
  { id: 'weekly-recap', trigger: 'Every Friday afternoon', action: 'prepare a weekly recap', enabled: true },
];

const scheduleIcons = { file: FileText, mail: Mail, calendar: CalendarDays };
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `orbit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(value = '09:00') {
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText || 9);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minuteText || '00'} ${suffix}`;
}

function scheduleCadence(item) {
  if (item.frequency === 'daily') return `Every day, ${formatTime(item.time)}`;
  if (item.frequency === 'monthly') return `Every month on day ${item.monthDay || 1}, ${formatTime(item.time)}`;
  return `Every ${item.day || 'Monday'}, ${formatTime(item.time)}`;
}

export default function TasksPage({ navigate, showNotice }) {
  const [schedules, setSchedules] = usePersistentState('orbit:v1:schedules', initialSchedules);
  const [automations, setAutomations] = usePersistentState('orbit:v1:automations', initialAutomations);
  const [dialog, setDialog] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [menu, setMenu] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ name: '', frequency: 'weekly', time: '09:00', day: 'Monday', monthDay: '1' });
  const [automationForm, setAutomationForm] = useState({ trigger: 'When a file is added', action: '' });

  const openSchedule = (item = null) => {
    setEditingId(item?.id ?? null);
    setScheduleForm(item ? {
      name: item.title,
      frequency: item.frequency || 'weekly',
      time: item.time || '09:00',
      day: item.day || 'Monday',
      monthDay: String(item.monthDay || 1),
    } : { name: '', frequency: 'weekly', time: '09:00', day: 'Monday', monthDay: '1' });
    setMenu('');
    setDialog('schedule');
  };

  const openAutomation = (item = null) => {
    setEditingId(item?.id ?? null);
    setAutomationForm(item ? { trigger: item.trigger, action: item.action } : { trigger: 'When a file is added', action: '' });
    setMenu('');
    setDialog('automation');
  };

  const saveSchedule = (event) => {
    event.preventDefault();
    const title = scheduleForm.name.trim();
    if (!title) return;
    const value = {
      id: editingId || makeId(),
      title,
      frequency: scheduleForm.frequency,
      time: scheduleForm.time || '09:00',
      day: scheduleForm.day,
      monthDay: Math.min(28, Math.max(1, Number(scheduleForm.monthDay) || 1)),
      icon: 'calendar',
      enabled: true,
    };
    setSchedules((all) => editingId ? all.map((item) => item.id === editingId ? { ...item, ...value } : item) : [...all, value]);
    setDialog(null);
    setEditingId(null);
    showNotice('Schedule saved in this browser. No background job was created.');
  };

  const saveAutomation = (event) => {
    event.preventDefault();
    const action = automationForm.action.trim();
    if (!action) return;
    const value = { id: editingId || makeId(), trigger: automationForm.trigger, action, enabled: true };
    setAutomations((all) => editingId ? all.map((item) => item.id === editingId ? { ...item, ...value } : item) : [...all, value]);
    setDialog(null);
    setEditingId(null);
    showNotice('Automation saved as a local demo rule; it will not run in the background.');
  };

  const toggleSchedule = (id) => setSchedules((all) => all.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  const toggleAutomation = (id) => setAutomations((all) => all.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  const confirmDelete = () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    if (target.type === 'schedule') setSchedules((all) => all.filter((item) => item.id !== target.id));
    if (target.type === 'automation') setAutomations((all) => all.filter((item) => item.id !== target.id));
    showNotice(`${target.label || 'Item'} removed from this browser.`);
  };

  return <div className="split-page task-page">
    <section className="page-content task-content">
      <div className="page-title-row">
        <div><h1>Schedules &amp; automations</h1><p className="page-subtitle">Set up work Orbit can run for you</p></div>
        <button className="primary-button" onClick={() => openSchedule()}><Plus size={16} /> Create schedule</button>
      </div>
      <div className="local-demo-note"><Clock3 size={14} /><span>These sample cards are browser-local previews. Use Live automations below for server-backed schedules and test runs.</span></div>
      <div className="schedule-grid">
        {schedules.map((item) => {
          const Icon = scheduleIcons[item.icon] || CalendarDays;
          return <article className="schedule-card" key={item.id}>
            <div className={`tile-icon ${item.icon === 'mail' ? 'lavender' : item.icon === 'calendar' ? 'purple' : 'mint'}`}><Icon size={18} /></div>
            <div className="schedule-copy"><h3>{item.title}</h3><p>{scheduleCadence(item)}</p><span className="next-run">{item.enabled ? 'Demo · not scheduled' : 'Paused'}</span></div>
            <div className="schedule-controls">
              <button className={`switch ${item.enabled ? 'on' : ''}`} aria-pressed={item.enabled} aria-label={`${item.enabled ? 'Pause' : 'Resume'} ${item.title}`} onClick={() => toggleSchedule(item.id)}><span /></button>
              <button className="dots-button" aria-label={`More options for ${item.title}`} onClick={() => setMenu(menu === `schedule-${item.id}` ? '' : `schedule-${item.id}`)}><MoreHorizontal size={18} /></button>
              {menu === `schedule-${item.id}` && <div className="inline-menu"><button onClick={() => openSchedule(item)}>Edit schedule</button><button className="danger-menu-item" onClick={() => { setDeleteTarget({ type: 'schedule', id: item.id, label: item.title }); setMenu(''); }}>Delete schedule</button></div>}
            </div>
          </article>;
        })}
        {schedules.length === 0 && <div className="empty-state schedule-empty"><CalendarDays size={22} /><b>No schedules yet</b><span>Create a local schedule preview to see it here.</span></div>}
      </div>
      <div className="section-heading-row automation-heading">
        <div><h2>Automations</h2><p>Triggered actions that run automatically</p></div>
        <button className="secondary-dark-button" onClick={() => openAutomation()}><Plus size={15} /> Add automation</button>
      </div>
      <div className="automation-list">
        {automations.map((item) => <AutomationRow
          key={item.id}
          item={item}
          menuOpen={menu === `automation-${item.id}`}
          onToggle={() => toggleAutomation(item.id)}
          onMenu={() => setMenu(menu === `automation-${item.id}` ? '' : `automation-${item.id}`)}
          onEdit={() => openAutomation(item)}
          onDelete={() => { setDeleteTarget({ type: 'automation', id: item.id, label: item.action }); setMenu(''); }}
        />)}
        {automations.length === 0 && <div className="empty-state automation-empty"><Check size={22} /><b>No automation rules yet</b><span>Add a local demo rule to see it here.</span></div>}
      </div>
      <div className="section-heading-row automation-heading live-automation-heading">
        <div><h2>Live automations</h2><p>Manus-style skills, tools, schedules, test runs, and inspectable results.</p></div>
      </div>
      <AgentWorkbenchPage showNotice={showNotice} embedded />
    </section>
    <aside className="inspector task-inspector">
      <div className="inspector-title"><h2>Workspace &amp; automations</h2><span className="demo-badge">DEMO</span></div>
      <button className="active-task-card" onClick={() => navigate('/task/compare')}>
        <div className="active-task-top"><span className="online-dot" /><div><b>Comparing project tools</b><small>Sample task · 3 sample sources</small></div></div>
        <span className="review-chip"><span className="mail-mini">▱</span> Review before sending <ChevronRight size={14} /></span>
        <div className="progress-list"><ProgressStep state="done" text="Understanding request" /><ProgressStep state="active" text="Searching sources" /><ProgressStep text="Preparing summary" /><ProgressStep text="Extracting key findings" /><ProgressStep text="Drafting comparison" /><ProgressStep text="Finalizing summary" /></div>
      </button>
      <div className="member-card"><span className="avatar">JD</span><span><b>Jordan Diaz</b><small>Workspace member</small></span><span className="online-dot" /></div>
      <div className="activity-empty"><span className="activity-file"><FileText size={16} /></span><span>{schedules.filter((item) => item.enabled).length} active schedule previews</span><small>Local only</small></div>
    </aside>

    {dialog && <div className="modal-backdrop" onMouseDown={() => setDialog(null)}>
      <form className="modal-card workflow-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={dialog === 'schedule' ? saveSchedule : saveAutomation}>
        <button type="button" className="modal-close" aria-label="Close" onClick={() => setDialog(null)}><X size={19} /></button>
        <div className="modal-icon">{dialog === 'schedule' ? <CalendarDays size={20} /> : <Check size={20} />}</div>
        <h2>{dialog === 'schedule' ? (editingId ? 'Edit schedule' : 'Create a schedule') : (editingId ? 'Edit automation' : 'Add an automation')}</h2>
        <p>{dialog === 'schedule' ? 'Set a local preview of when this recurring task should run.' : 'Choose a trigger and the action Orbit would take in a connected version.'}</p>
        {dialog === 'schedule' ? <>
          <label htmlFor="schedule-name">Schedule name</label>
          <input id="schedule-name" autoFocus required maxLength={80} value={scheduleForm.name} onChange={(event) => setScheduleForm((form) => ({ ...form, name: event.target.value }))} placeholder="e.g. Monday team update" />
          <div className="modal-fields-row">
            <div><label htmlFor="schedule-frequency">Cadence</label><select id="schedule-frequency" value={scheduleForm.frequency} onChange={(event) => setScheduleForm((form) => ({ ...form, frequency: event.target.value }))}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
            <div><label htmlFor="schedule-time">Time</label><input id="schedule-time" type="time" value={scheduleForm.time} onChange={(event) => setScheduleForm((form) => ({ ...form, time: event.target.value }))} /></div>
          </div>
          {scheduleForm.frequency === 'weekly' && <><label htmlFor="schedule-day">Day of week</label><select id="schedule-day" value={scheduleForm.day} onChange={(event) => setScheduleForm((form) => ({ ...form, day: event.target.value }))}>{weekdays.map((day) => <option key={day}>{day}</option>)}</select></>}
          {scheduleForm.frequency === 'monthly' && <><label htmlFor="schedule-monthday">Day of month</label><input id="schedule-monthday" type="number" min="1" max="28" value={scheduleForm.monthDay} onChange={(event) => setScheduleForm((form) => ({ ...form, monthDay: event.target.value }))} /></>}
          <button className="primary-button modal-submit" type="submit">{editingId ? 'Save schedule' : 'Create local schedule'}</button>
        </> : <>
          <label htmlFor="automation-trigger">When</label>
          <select id="automation-trigger" value={automationForm.trigger} onChange={(event) => setAutomationForm((form) => ({ ...form, trigger: event.target.value }))}><option>When a file is added</option><option>When a meeting ends</option><option>Every Friday afternoon</option><option>When a task is completed</option></select>
          <label htmlFor="automation-action">Then do</label>
          <input id="automation-action" autoFocus required maxLength={100} value={automationForm.action} onChange={(event) => setAutomationForm((form) => ({ ...form, action: event.target.value }))} placeholder="e.g. summarize it" />
          <button className="primary-button modal-submit" type="submit">{editingId ? 'Save rule' : 'Add local rule'}</button>
        </>}
        <span className="modal-local-note">Saved in this browser only. It will not run in the background.</span>
      </form>
    </div>}

    {deleteTarget && <div className="modal-backdrop" onMouseDown={() => setDeleteTarget(null)}><div className="modal-card confirm-modal" onMouseDown={(event) => event.stopPropagation()}>
      <button type="button" className="modal-close" aria-label="Close" onClick={() => setDeleteTarget(null)}><X size={19} /></button><div className="modal-icon warning-icon"><Trash2 size={19} /></div>
      <h2>Delete this {deleteTarget.type}?</h2><p>“{deleteTarget.label}” will be removed from this browser’s local demo state.</p>
      <div className="confirm-actions"><button type="button" className="secondary-button" onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="danger-button" onClick={confirmDelete}>Delete</button></div>
    </div></div>}
  </div>;
}

function AutomationRow({ item, menuOpen, onToggle, onMenu, onEdit, onDelete }) {
  return <div className="automation-row">
    <div className="automation-flow"><span>{item.trigger}</span><ChevronRight size={14} /><b>{item.action}</b></div>
    <div className="automation-state"><button className={`switch ${item.enabled ? 'on' : ''}`} aria-pressed={item.enabled} aria-label={`${item.enabled ? 'Pause' : 'Resume'} automation: ${item.trigger}`} onClick={onToggle}><span /></button><small>{item.enabled ? 'Enabled' : 'Paused'}</small><button className="dots-button row-menu-button" aria-label="Automation options" onClick={onMenu}><MoreHorizontal size={17} /></button>
      {menuOpen && <div className="inline-menu automation-menu"><button onClick={onEdit}>Edit rule</button><button className="danger-menu-item" onClick={onDelete}>Delete rule</button></div>}
    </div>
  </div>;
}

function ProgressStep({ state = '', text }) {
  return <div className={`progress-step ${state}`}><span className="step-marker">{state === 'done' ? <Check size={12} /> : null}</span><span>{text}</span></div>;
}
