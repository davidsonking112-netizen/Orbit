import { useState } from 'react';
import {
  ArrowLeft, ArrowUp, Check, CheckCircle2, ChevronDown, ChevronRight,
  Download, FileSpreadsheet, FileText, Link2, MoreHorizontal, Paperclip,
  Pause, Play, Plus, RotateCcw, Search, Sparkles, X,
} from 'lucide-react';
import usePersistentState from '../hooks/usePersistentState.js';
import { createSuggestedPlan } from '../lib/localWorkspaceStore.js';

const sampleProgress = ['Understanding request', 'Searching sources', 'Comparing options', 'Preparing recommendation'];
const initialCanvas = {
  enabled: false,
  type: 'Document',
  title: 'Untitled document',
  content: '',
  prompt: '',
  revision: 0,
  rows: [
    ['Item', 'Details', 'Status'],
    ['Research', 'Sources and notes', 'Planned'],
    ['Summary', 'Key findings', 'In progress'],
  ],
};
const statusLabels = {
  draft: 'Draft',
  'plan-review': 'Plan review',
  'waiting-demo': 'Waiting · local preview',
  'working-demo': 'Working · local preview',
  paused: 'Paused',
  'review-required': 'Review required',
  completed: 'Completed locally',
  cancelled: 'Cancelled locally',
};

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromPrompt(text) {
  const cleaned = text.replace(/^(please\s+)?(create|draft|write|make|build)\s+(me\s+)?(a|an)?\s*/i, '').trim();
  const short = cleaned.split(/[.!?\n]/)[0].trim();
  if (!short) return 'New task';
  return short.length > 42 ? `${short.slice(0, 39).trim()}…` : short[0].toUpperCase() + short.slice(1);
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadCanvasFile(canvas, showNotice) {
  const isSheet = canvas.type === 'Spreadsheet';
  const extension = isSheet ? 'csv' : 'md';
  const safeTitle = (canvas.title || 'orbit-draft').normalize('NFKD').replace(/[^\w -]/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'orbit-draft';
  const body = isSheet
    ? (canvas.rows || []).map((row) => row.map(csvCell).join(',')).join('\r\n')
    : `# ${canvas.title || 'Untitled document'}\n\n${canvas.content || ''}${canvas.content ? '\n' : ''}`;
  const blob = new Blob([body], { type: isSheet ? 'text/csv;charset=utf-8' : 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeTitle}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showNotice(`Downloaded ${extension.toUpperCase()} draft. It was created locally; nothing was uploaded.`);
}

export default function TaskChatPage({ runId, run, updateRun, createNewTask, navigate, showNotice }) {
  const [message, setMessage] = useState('');
  const [sampleSent, setSampleSent] = usePersistentState('orbit:v1:chat-messages', []);
  const [sampleCanvas, setSampleCanvas] = usePersistentState('orbit:v1:canvas', initialCanvas);
  const [plusOpen, setPlusOpen] = useState(false);
  const isSample = runId === 'compare';
  const isMissingRun = !isSample && !run;
  const canvas = run ? { ...initialCanvas, ...(run.canvas || {}) } : sampleCanvas;
  const messages = run ? (Array.isArray(run.messages) ? run.messages : []) : sampleSent;
  const isTerminal = run && ['completed', 'cancelled'].includes(run.status);

  const patchRun = (update) => {
    if (!run) return;
    updateRun(run.id, (current) => typeof update === 'function' ? update(current) : update);
  };

  const updateCanvasState = (updater) => {
    if (run) {
      patchRun((current) => ({ canvas: updater({ ...initialCanvas, ...(current.canvas || {}) }) }));
    } else {
      setSampleCanvas(updater);
    }
  };

  const updateCanvas = (patch) => updateCanvasState((current) => ({ ...current, ...patch }));
  const addSheetRow = () => updateCanvasState((current) => ({ ...current, rows: [...current.rows, ['', '', '']] }));
  const removeSheetRow = (index) => updateCanvasState((current) => ({ ...current, rows: current.rows.filter((_, rowIndex) => rowIndex === 0 || rowIndex !== index) }));
  const updateSheetCell = (rowIndex, cellIndex, value) => updateCanvasState((current) => ({ ...current, rows: current.rows.map((row, currentRow) => currentRow === rowIndex ? row.map((cell, currentCell) => currentCell === cellIndex ? value : cell) : row) }));

  const send = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || isTerminal || isMissingRun) return;
    const item = { id: makeId(), text, role: 'user', createdAt: new Date().toISOString() };

    if (run) {
      patchRun((current) => {
        const isFirstPrompt = !current.prompt;
        const nextMessages = [...(Array.isArray(current.messages) ? current.messages : []), item];
        const next = { messages: nextMessages };
        if (isFirstPrompt) {
          next.prompt = text;
          next.title = titleFromPrompt(text);
          next.status = 'plan-review';
          next.planSteps = createSuggestedPlan();
          next.statusHistory = [...(current.statusHistory || []), { status: 'plan-review', label: 'Suggested plan is ready to review', at: new Date().toISOString() }];
        }
        const currentCanvas = { ...initialCanvas, ...(current.canvas || {}) };
        if (currentCanvas.enabled) {
          const revision = currentCanvas.revision + 1;
          const title = currentCanvas.revision === 0 ? titleFromPrompt(text) : currentCanvas.title;
          if (currentCanvas.type === 'Spreadsheet') {
            next.canvas = { ...currentCanvas, prompt: text, title: currentCanvas.revision === 0 ? title : currentCanvas.title, revision, rows: [...currentCanvas.rows, [`Update ${revision}`, text, 'Draft']] };
          } else {
            const addition = currentCanvas.revision === 0 ? `Request: ${text}\n\nLocal draft notes:\n- Outline the key sections\n- Add supporting details\n- Review and refine` : `\n\nFollow-up ${revision}: ${text}`;
            next.canvas = { ...currentCanvas, prompt: text, title: currentCanvas.revision === 0 ? title : currentCanvas.title, revision, content: `${currentCanvas.content}${currentCanvas.content ? '\n\n' : ''}${addition}` };
          }
        }
        return next;
      });
      if (canvas.enabled) showNotice('Canvas preview updated locally. No AI request was sent.');
      else if (!run.prompt) showNotice('Request saved. Review the local plan template before starting a preview.');
      else showNotice('Message saved in this browser only. No AI request was sent.');
    } else {
      setSampleSent((all) => [...all, item]);
      if (canvas.enabled) {
        updateCanvasState((current) => {
          const revision = current.revision + 1;
          const title = current.revision === 0 ? titleFromPrompt(text) : current.title;
          if (current.type === 'Spreadsheet') return { ...current, prompt: text, title, revision, rows: [...current.rows, [`Update ${revision}`, text, 'Draft']] };
          const addition = current.revision === 0 ? `Request: ${text}\n\nLocal draft notes:\n- Outline the key sections\n- Add supporting details\n- Review and refine` : `\n\nFollow-up ${revision}: ${text}`;
          return { ...current, prompt: text, title, revision, content: `${current.content}${current.content ? '\n\n' : ''}${addition}` };
        });
        showNotice('Canvas preview updated locally. No AI request was sent.');
      } else {
        showNotice('Message saved in this browser only. No AI request was sent.');
      }
    }
    setMessage('');
  };

  const enableCanvas = () => {
    updateCanvas({ enabled: true });
    setPlusOpen(false);
    showNotice('Canvas mode enabled for this chat. Drafts stay in this browser.');
  };
  const disableCanvas = () => updateCanvas({ enabled: false });

  if (isMissingRun) return <div className="missing-run-view"><div className="run-empty-mark"><Sparkles size={21} /></div><h1>Local run not found</h1><p>This task is not saved in this browser. Start a fresh local run to continue.</p><button className="run-primary-button" onClick={createNewTask}><Plus size={15} /> New task</button></div>;

  return <div className="split-page chat-page">
    <section className="page-content conversation-content">
      <div className="conversation-heading"><button className="back-link" onClick={() => navigate('/tasks')}><ArrowLeft size={16} /> Schedules</button><div className="conversation-title"><span className={`live-pulse ${run ? 'local-run-pulse' : ''}`} /><div><h1>{run?.title || 'Comparing project tools'}</h1><p>{run ? 'Local task run' : 'Sample task'} <span>·</span> Saved in this browser</p></div></div><button className="dots-button" aria-label="Conversation options" onClick={() => showNotice('This is a local chat preview; no remote conversation is connected.')}><MoreHorizontal size={18} /></button></div>
      <div className="conversation-demo-note">{run ? 'Local preview only — plan and status changes are saved here; no AI, agent, or background work is running.' : 'Sample conversation preview — messages are stored locally; no AI response is running.'}</div>
      <div className="conversation-stream">
        {isSample && <>
          <div className="user-message"><p>Compare the best project management tools for a small remote team and recommend one.</p><small>Sample request · prototype</small></div>
          <div className="agent-message"><div className="agent-avatar"><Sparkles size={17} /></div><div className="agent-message-body"><div className="agent-label">Orbit <span>sample response</span></div><p>This sample layout shows how a research update and recommendation could appear. Connect an AI service later to generate real task results.</p><div className="source-chips"><span><Search size={13} /> Sample research</span><span><FileText size={13} /> Demo sources</span></div><div className="working-card"><div className="working-card-head"><span><span className="live-pulse small-pulse" /> Example task progress</span><small>Sample</small></div><div className="working-progress"><span /></div><p>Static progress example — the prototype is not searching or running a task.</p></div></div></div>
          {messages.map((item) => <div className="user-message new-message" key={item.id}><p>{item.text}</p><small>You · saved locally</small></div>)}
        </>}
        {run && !run.prompt && <div className="run-empty-state"><div className="run-empty-mark"><Sparkles size={19} /></div><h2>What should Orbit help you organize?</h2><p>Describe a task below. Orbit will save it in this browser and prepare an editable plan template—no AI request or background task will start.</p></div>}
        {run && messages.map((item) => <div className="user-message new-message" key={item.id}><p>{item.text}</p><small>You · saved locally</small></div>)}
        {run?.prompt && <LocalRunPlan run={run} patchRun={patchRun} showNotice={showNotice} />}
        {canvas.enabled && <CanvasWorkbench canvas={canvas} updateCanvas={updateCanvas} addSheetRow={addSheetRow} removeSheetRow={removeSheetRow} updateSheetCell={updateSheetCell} showNotice={showNotice} />}
      </div>
      <form className="composer" onSubmit={send}>
        {canvas.enabled && <div className="canvas-mode-chip"><span className="canvas-chip-icon"><FileText size={13} /></span><span>Canvas mode <small>· {canvas.type}</small></span><button type="button" onClick={disableCanvas} aria-label="Turn off Canvas mode"><X size={13} /></button></div>}
        <textarea value={message} disabled={Boolean(isTerminal || isMissingRun)} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={isTerminal ? 'Retry this local run to continue…' : canvas.enabled ? `Describe an update to the ${canvas.type.toLowerCase()}…` : run ? 'Describe the task or add a follow-up…' : 'Message Orbit or add instructions…'} rows={1} aria-label="Message Orbit" />
        <div className="composer-actions"><div className="composer-tools"><div className="composer-plus-wrap"><button type="button" className={`composer-plus ${plusOpen ? 'active' : ''}`} onClick={() => setPlusOpen((open) => !open)} aria-label="Add a tool or file" aria-expanded={plusOpen}><Plus size={17} /></button>{plusOpen && <div className="composer-plus-menu"><button type="button" className="plus-menu-item" onClick={enableCanvas}><span className="plus-menu-icon canvas-menu-icon"><FileText size={16} /></span><span><b>Create with Canvas</b><small>Draft a document or spreadsheet in chat</small></span></button><button type="button" className="plus-menu-item" onClick={() => { setPlusOpen(false); showNotice('File attachments are not connected in this local prototype.'); }}><span className="plus-menu-icon attach-menu-icon"><Paperclip size={16} /></span><span><b>Attach a file</b><small>Attachment support is not connected in this local-only phase</small></span></button></div>}</div><span className="composer-hint">{canvas.enabled ? 'Local editable preview · no AI call' : 'Messages stay in this browser'}</span></div><button className="send-button" type="submit" aria-label="Save message" disabled={Boolean(isTerminal || isMissingRun)}><ArrowUp size={17} /></button></div>
      </form>
    </section>
    {run ? <LocalRunInspector run={run} /> : <SampleInspector />}
  </div>;
}

function LocalRunPlan({ run, patchRun, showNotice }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const status = run.status || 'draft';
  const steps = Array.isArray(run.planSteps) ? run.planSteps : [];
  const allDone = steps.length > 0 && steps.every((step) => step.done);

  const setStatus = (nextStatus, label, message) => {
    patchRun((current) => ({
      status: nextStatus,
      statusHistory: [...(current.statusHistory || []), { status: nextStatus, label, at: new Date().toISOString() }],
    }));
    showNotice(message);
  };
  const setStepTitle = (id, title) => patchRun((current) => ({ planSteps: current.planSteps.map((step) => step.id === id ? { ...step, title } : step) }));
  const toggleStep = (id) => patchRun((current) => ({ planSteps: current.planSteps.map((step) => step.id === id ? { ...step, done: !step.done } : step) }));
  const addStep = () => patchRun((current) => ({ planSteps: [...current.planSteps, { id: makeId(), title: 'New plan step', done: false }] }));
  const removeStep = (id) => patchRun((current) => ({ planSteps: current.planSteps.filter((step) => step.id !== id) }));
  const retry = () => {
    patchRun((current) => ({
      status: 'plan-review',
      planSteps: current.planSteps.map((step) => ({ ...step, done: false })),
      statusHistory: [...(current.statusHistory || []), { status: 'plan-review', label: 'Run returned to plan review', at: new Date().toISOString() }],
    }));
    showNotice('Run reset to plan review locally. No work was retried.');
  };

  return <section className="local-run-card" aria-label="Local task plan">
    <header className="local-run-card-header"><div className="local-run-card-icon"><CheckCircle2 size={17} /></div><div><b>{status === 'plan-review' ? 'Review the suggested plan' : status === 'waiting-demo' ? 'Plan approved · waiting locally' : 'Local task plan'}</b><small>Editable template · not generated by AI</small></div><span className={`local-run-status status-${status}`}>{statusLabels[status] || 'Local preview'}</span></header>
    <div className="local-run-disclosure">This is a local workflow preview. Approve, wait, and working states only change this browser; no agent, background job, or external action runs.</div>
    <div className="local-run-steps">
      {steps.map((step, index) => <div key={step.id} className={`local-run-step ${step.done ? 'done' : ''}`}>
        <span className="local-step-number">{step.done ? <Check size={12} /> : index + 1}</span>
        {status === 'plan-review' ? <input aria-label={`Plan step ${index + 1}`} value={step.title} maxLength={120} onChange={(event) => setStepTitle(step.id, event.target.value)} /> : <span className="local-step-title">{step.title}</span>}
        {status === 'plan-review' && steps.length > 1 && <button type="button" className="local-step-remove" aria-label={`Remove plan step ${index + 1}`} onClick={() => removeStep(step.id)}><X size={13} /></button>}
        {status === 'working-demo' && <button type="button" className={`local-step-toggle ${step.done ? 'marked' : ''}`} onClick={() => toggleStep(step.id)}>{step.done ? 'Undo local mark' : 'Mark done locally'}</button>}
        {status !== 'plan-review' && status !== 'working-demo' && <small className="local-step-state">{step.done ? 'Marked done locally' : 'Preview step'}</small>}
      </div>)}
    </div>
    {status === 'plan-review' && <button type="button" className="local-add-step" onClick={addStep}><Plus size={13} /> Add plan step</button>}
    <div className="local-run-actions">
      {status === 'plan-review' && <><button type="button" className="run-primary-button" onClick={() => setStatus('waiting-demo', 'Plan approved locally', 'Plan approved locally. This does not start an agent or task.')}><Check size={14} /> Approve plan locally</button><button type="button" className="run-danger-button" onClick={() => setConfirmCancel(true)}>Cancel</button></>}
      {status === 'waiting-demo' && <><span className="local-review-note">Waiting state is a manual preview; nothing is queued or running.</span><button type="button" className="run-primary-button" onClick={() => setStatus('working-demo', 'Working preview shown', 'Showing the working-state preview only. No task is running.')}><Play size={14} /> Show working preview</button><button type="button" className="run-danger-button" onClick={() => setConfirmCancel(true)}>Cancel</button></>}
      {status === 'working-demo' && <><button type="button" className="run-secondary-button" onClick={() => setStatus('paused', 'Local preview paused', 'Preview marked paused locally; no work was running.')}><Pause size={14} /> Pause preview</button><button type="button" className="run-primary-button" disabled={!allDone} title={!allDone ? 'Mark each plan step done locally first' : ''} onClick={() => setStatus('review-required', 'Moved to review', 'Moved to review locally. No output was generated.')}><CheckCircle2 size={14} /> Send to review</button><button type="button" className="run-danger-button" onClick={() => setConfirmCancel(true)}>Cancel</button></>}
      {status === 'paused' && <><button type="button" className="run-primary-button" onClick={() => setStatus('working-demo', 'Local preview resumed', 'Preview marked resumed locally; no work is running.')}><Play size={14} /> Resume preview</button><button type="button" className="run-danger-button" onClick={() => setConfirmCancel(true)}>Cancel</button></>}
      {status === 'review-required' && <><span className="local-review-note">Review this local preview, then approve it locally or retry the plan.</span><button type="button" className="run-primary-button" onClick={() => setStatus('completed', 'Preview approved locally', 'Preview approved locally. No agent work was performed.')}><Check size={14} /> Approve preview locally</button><button type="button" className="run-secondary-button" onClick={retry}><RotateCcw size={14} /> Retry plan</button><button type="button" className="run-danger-button" onClick={() => setConfirmCancel(true)}>Cancel</button></>}
      {(status === 'completed' || status === 'cancelled') && <><span className="local-review-note">This run is {status} in local demo state; no agent executed it.</span><button type="button" className="run-secondary-button" onClick={retry}><RotateCcw size={14} /> Retry from plan review</button></>}
    </div>
    {confirmCancel && <div className="run-confirm-backdrop" role="presentation"><section className="run-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-run-title"><h3 id="cancel-run-title">Cancel this local preview?</h3><p>This changes the saved status to cancelled. No background task is running.</p><div><button type="button" className="run-secondary-button" onClick={() => setConfirmCancel(false)}>Keep preview</button><button type="button" className="run-danger-button" onClick={() => { setConfirmCancel(false); setStatus('cancelled', 'Local preview cancelled', 'Run marked cancelled locally. Nothing was stopped externally.'); }}>Cancel preview</button></div></section></div>}
  </section>;
}

function LocalRunInspector({ run }) {
  const history = Array.isArray(run.statusHistory) ? run.statusHistory.slice(-4).reverse() : [];
  return <aside className="inspector chat-inspector"><div className="inspector-title"><h2>Task progress</h2><span className="demo-badge">LOCAL</span></div><div className="progress-summary"><div className="summary-icon"><Sparkles size={16} /></div><div><b>{run.title || 'New task'}</b><small>{statusLabels[run.status] || 'Draft'} · local state only</small></div></div><div className="local-inspector-note">No AI, agent, or background task is running. Use the plan controls to change demo state locally.</div><div className="local-history-title"><b>Run activity</b><span>In this browser</span></div><div className="local-history-list">{history.map((item, index) => <div className={`local-history-item ${index === 0 ? 'current' : ''}`} key={`${item.at}-${item.status}`}><span className="local-history-marker">{index === 0 ? <Check size={10} /> : null}</span><span><b>{item.label}</b><small>{new Date(item.at).toLocaleString()}</small></span></div>)}</div><div className="source-section"><div className="source-section-title"><b>Plan steps</b><span>{(run.planSteps || []).length}</span></div>{(run.planSteps || []).map((step) => <div className="source-item" key={step.id}><span className={`source-type ${step.done ? 'web-source' : 'file-source'}`}>{step.done ? <Check size={13} /> : <FileText size={13} />}</span><span><b>{step.title}</b><small>{step.done ? 'Marked done locally' : 'Preview only'}</small></span></div>)}</div><div className="task-inspector-footer"><span className="avatar">JD</span><span><b>Jordan Diaz</b><small>Saved on this device</small></span></div></aside>;
}

function SampleInspector() {
  return <aside className="inspector chat-inspector"><div className="inspector-title"><h2>Task progress</h2><span className="demo-badge">SAMPLE</span></div><div className="progress-summary"><div className="summary-icon"><Sparkles size={16} /></div><div><b>Comparing project tools</b><small>Static research preview · not running</small></div></div><div className="review-panel"><span className="review-shield">✓</span><span><b>Review before sending</b><small>Approval example shown for UI only; nothing will be sent externally.</small></span><ChevronRight size={15} /></div><div className="task-timeline">{sampleProgress.map((step, index) => <div key={step} className={`timeline-step ${index < 1 ? 'complete' : index === 1 ? 'current' : ''}`}><span className="timeline-marker">{index < 1 && <Check size={11} />}</span><span>{step}</span>{index === 1 && <small>Sample</small>}</div>)}</div><div className="source-section"><div className="source-section-title"><b>Sources</b><span>Demo</span></div><div className="source-item"><span className="source-type web-source"><Link2 size={14} /></span><span><b>Project management tools</b><small>Sample source card</small></span><ChevronRight size={14} /></div><div className="source-item"><span className="source-type file-source"><FileText size={14} /></span><span><b>Team requirements</b><small>Sample workspace file</small></span><ChevronRight size={14} /></div></div><div className="task-inspector-footer"><span className="avatar">JD</span><span><b>Jordan Diaz</b><small>Workspace member · sample</small></span></div></aside>;
}

function CanvasWorkbench({ canvas, updateCanvas, addSheetRow, removeSheetRow, updateSheetCell, showNotice }) {
  const isSheet = canvas.type === 'Spreadsheet';
  return <section className="canvas-workbench" aria-label="Canvas file workspace">
    <div className="canvas-workbench-header"><div className="canvas-heading"><span className="canvas-icon">{isSheet ? <FileSpreadsheet size={16} /> : <FileText size={16} />}</span><span><b>Canvas · local draft</b><small>{canvas.revision ? `${canvas.revision} prompt update${canvas.revision === 1 ? '' : 's'} · editable below` : 'Choose a type and start a draft'}</small></span></div><label className="canvas-type-select"><select value={canvas.type} onChange={(event) => updateCanvas({ type: event.target.value })} aria-label="Canvas file type"><option>Document</option><option>Spreadsheet</option></select><ChevronDown size={13} /></label></div>
    <div className={`canvas-sheet-preview ${isSheet ? 'spreadsheet-preview' : ''}`}>
      <div className="canvas-paper-label">{canvas.revision ? 'LOCAL DRAFT · NOT AI-GENERATED' : 'CANVAS DRAFT PREVIEW'}</div>
      <input className="canvas-title-input" aria-label="Canvas file title" value={canvas.title} maxLength={80} onChange={(event) => updateCanvas({ title: event.target.value })} />
      {isSheet ? <>
        <div className="canvas-editable-grid">{canvas.rows.map((row, rowIndex) => <div className={`canvas-editable-row ${rowIndex === 0 ? 'header-row' : ''}`} key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => <input key={`cell-${rowIndex}-${cellIndex}`} aria-label={`Row ${rowIndex + 1}, column ${cellIndex + 1}`} value={cell} onChange={(event) => updateSheetCell(rowIndex, cellIndex, event.target.value)} />)}{rowIndex > 0 && <button type="button" className="remove-sheet-row" aria-label={`Remove row ${rowIndex}`} onClick={() => removeSheetRow(rowIndex)}><X size={12} /></button>}</div>)}</div>
        <button type="button" className="canvas-add-row" onClick={addSheetRow}><Plus size={13} /> Add row</button>
      </> : <>
        <textarea className="canvas-document-editor" aria-label="Canvas document draft" value={canvas.content} onChange={(event) => updateCanvas({ content: event.target.value })} placeholder="Type a local draft here, or send a prompt in the chat to add a draft outline…" />
        {canvas.prompt && <div className="canvas-last-prompt"><Sparkles size={13} /><span>Latest prompt: {canvas.prompt}</span></div>}
      </>}
    </div>
    <div className="canvas-workbench-footer"><span className="canvas-draft-status drafting"><span />Saved in this browser · no AI request</span><div className="canvas-footer-actions"><button type="button" className="canvas-export-button" onClick={() => downloadCanvasFile(canvas, showNotice)}><Download size={13} /> Download {isSheet ? 'CSV' : 'Markdown'}</button><button type="button" onClick={() => document.querySelector('.canvas-title-input')?.focus()}>Edit draft <ChevronRight size={13} /></button></div></div>
  </section>;
}
