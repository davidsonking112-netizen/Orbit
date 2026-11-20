import { useEffect, useMemo, useState } from 'react';
import { Activity, Check, Clock3, ExternalLink, FlaskConical, Globe2, Pause, Play, Plus, RefreshCw, Search, Sparkles, Trash2, Wrench } from 'lucide-react';

async function api(path, options) {
  const response = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Orbit runtime request failed.');
  return data;
}

const fallbackPrompt = 'Research the latest practical guidance for small teams adopting AI tools and cite the strongest sources.';

export default function AgentWorkbenchPage({ showNotice, embedded = false }) {
  const [capabilities, setCapabilities] = useState({ skills: [], tools: [] });
  const [schedules, setSchedules] = useState([]);
  const [runs, setRuns] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedTools, setSelectedTools] = useState(['web_search']);
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');
  const [scheduleForm, setScheduleForm] = useState({ name: 'Daily research brief', prompt: fallbackPrompt, intervalSeconds: '3600' });

  const load = async () => {
    try {
      const [caps, state] = await Promise.all([api('/api/capabilities'), api('/api/schedules')]);
      setCapabilities(caps); setSchedules(state.schedules || []); setRuns(state.runs || []); setRuntimeError('');
    } catch (error) { setRuntimeError(error.message); }
  };
  useEffect(() => { load(); }, []);
  const selectedSkillNames = useMemo(() => capabilities.skills.filter((skill) => selectedSkills.includes(skill.id)).map((skill) => skill.name), [capabilities.skills, selectedSkills]);

  const execute = async (event) => {
    event?.preventDefault();
    const text = prompt.trim() || fallbackPrompt;
    setLoading(true); setRuntimeError('');
    try { const data = await api('/api/agent/run', { method: 'POST', body: JSON.stringify({ prompt: text, skillIds: selectedSkills, toolIds: selectedTools }) }); setRun(data.run); showNotice('Agent run completed with live tool results.'); await load(); }
    catch (error) { setRuntimeError(error.message); }
    finally { setLoading(false); }
  };
  const toggle = (setter, id) => setter((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const createSchedule = async (event) => {
    event.preventDefault();
    try { await api('/api/schedules', { method: 'POST', body: JSON.stringify({ ...scheduleForm, intervalSeconds: Number(scheduleForm.intervalSeconds), skillIds: selectedSkills, toolIds: selectedTools }) }); showNotice('Real server schedule created.'); await load(); }
    catch (error) { setRuntimeError(error.message); }
  };
  const scheduleAction = async (schedule, action) => {
    try { if (action === 'run') { const data = await api(`/api/schedules/${schedule.id}/run`, { method: 'POST' }); setRun(data.run); showNotice('Schedule test run completed.'); } else if (action === 'delete') await api(`/api/schedules/${schedule.id}`, { method: 'DELETE' }); else await api(`/api/schedules/${schedule.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !schedule.enabled }) }); await load(); }
    catch (error) { setRuntimeError(error.message); }
  };

  return <section className={`page-content agent-workbench-page ${embedded ? 'embedded-agent-workbench' : ''}`}>
    {!embedded && <div className="page-title-row"><div><h1>Agent workbench</h1><p className="page-subtitle">Live web search, composable skills, tools, and real automations</p></div><button className="secondary-dark-button" onClick={load}><RefreshCw size={14} /> Refresh runtime</button></div>}
    {embedded && <div className="embedded-workbench-actions"><span>Runtime controls</span><button className="secondary-dark-button" onClick={load}><RefreshCw size={14} /> Refresh</button></div>}
    <div className="agent-runtime-banner"><span className="online-dot" /><div><b>Runtime connected</b><span>Server-side execution is enabled. Tools run in parallel when selected; skills load progressively from metadata to instructions.</span></div><span className="demo-badge">LIVE</span></div>
    {runtimeError && <div className="agent-error" role="alert">{runtimeError} <button onClick={load}>Retry</button></div>}
    <div className="agent-grid">
      <section className="agent-run-panel">
        <div className="agent-panel-heading"><div><h2>Run an agent workflow</h2><p>Describe the outcome. Orbit selects or uses the skills and tools below.</p></div><Sparkles size={19} /></div>
        <form onSubmit={execute}><textarea className="agent-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={fallbackPrompt} /><div className="agent-selection-summary"><span>{selectedSkillNames.length ? `Skills: ${selectedSkillNames.join(', ')}` : 'No skill forced · automatic selection'}</span><span>{selectedTools.length} tool{selectedTools.length === 1 ? '' : 's'} selected</span></div><button className="primary-button agent-run-button" disabled={loading}>{loading ? <><Activity size={15} /> Running tools…</> : <><Play size={15} /> Run live workflow</>}</button></form>
        {run && <div className="agent-result"><div className="agent-result-heading"><div><b>{run.summary}</b><small>{new Date(run.createdAt).toLocaleString()} · {run.source}</small></div><span className="status-completed">COMPLETED</span></div><div className="agent-plan"><b>Plan and execution</b>{run.plan.map((step) => <span key={step}><Check size={12} /> {step}</span>)}</div>{run.results.map((item) => <ToolResult key={item.toolId} item={item} />)}</div>}
      </section>
      <section className="agent-catalog-panel"><CatalogSection title="Skills" icon={Sparkles} items={capabilities.skills} selected={selectedSkills} onToggle={(id) => toggle(setSelectedSkills, id)} /><CatalogSection title="Tools" icon={Wrench} items={capabilities.tools} selected={selectedTools} onToggle={(id) => toggle(setSelectedTools, id)} /></section>
    </div>
    <section className="automation-panel"><div className="agent-panel-heading"><div><h2>Real automations</h2><p>Persisted on the Orbit runtime. Test, pause, resume, or delete each schedule.</p></div><Clock3 size={19} /></div><form className="automation-create-form" onSubmit={createSchedule}><input value={scheduleForm.name} onChange={(event) => setScheduleForm({ ...scheduleForm, name: event.target.value })} placeholder="Automation name" /><input value={scheduleForm.prompt} onChange={(event) => setScheduleForm({ ...scheduleForm, prompt: event.target.value })} placeholder="What should Orbit do?" /><label>Every <input type="number" min="60" value={scheduleForm.intervalSeconds} onChange={(event) => setScheduleForm({ ...scheduleForm, intervalSeconds: event.target.value })} /> seconds</label><button className="primary-button" type="submit"><Plus size={15} /> Create schedule</button></form><div className="schedule-table">{schedules.length === 0 && <div className="agent-empty">No live schedules yet. Create one above, then use Test run.</div>}{schedules.map((schedule) => <div className="agent-schedule-row" key={schedule.id}><div><b>{schedule.name}</b><small>{schedule.prompt}</small></div><span className={schedule.enabled ? 'schedule-live' : 'schedule-paused'}>{schedule.enabled ? 'Active' : 'Paused'} · next {new Date(schedule.nextRunAt).toLocaleString()}</span><div className="schedule-row-actions"><button onClick={() => scheduleAction(schedule, 'run')} title="Test run"><FlaskConical size={14} /></button><button onClick={() => scheduleAction(schedule, 'toggle')} title={schedule.enabled ? 'Pause' : 'Resume'}>{schedule.enabled ? <Pause size={14} /> : <Play size={14} />}</button><button onClick={() => scheduleAction(schedule, 'delete')} title="Delete"><Trash2 size={14} /></button></div></div>)}</div></section>
    <section className="automation-panel run-history-panel"><div className="agent-panel-heading"><div><h2>Run history</h2><p>Every manual and scheduled run is inspectable.</p></div><Activity size={19} /></div>{runs.length ? runs.map((item) => <div className="run-history-row" key={item.id}><span className="history-dot" /><div><b>{item.summary}</b><small>{item.source} · {new Date(item.createdAt).toLocaleString()}</small></div><span>{item.toolIds?.join(' + ')}</span></div>) : <div className="agent-empty">Run the workflow to create inspectable history.</div>}</section>
  </section>;
}

function CatalogSection({ title, icon: Icon, items, selected, onToggle }) { return <div className="catalog-section"><div className="catalog-heading"><h2><Icon size={16} /> {title}</h2><span>{items.length} available</span></div>{items.map((item) => <label className={`catalog-item ${selected.includes(item.id) ? 'selected' : ''}`} key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} /><span><b>{item.name}</b><small>{item.description}</small></span></label>)}</div>; }
function ToolResult({ item }) { const result = item.result; return <div className="tool-result"><div><b><Globe2 size={13} /> {item.toolId}</b><span className={item.status === 'completed' ? 'result-ok' : 'result-fail'}>{item.status}</span></div>{item.error ? <p>{item.error}</p> : item.toolId === 'web_search' ? <div className="search-results">{result.results.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.title}</span><small>{source.snippet}</small><ExternalLink size={12} /></a>)}</div> : <pre>{JSON.stringify(result, null, 2)}</pre>}</div>; }
