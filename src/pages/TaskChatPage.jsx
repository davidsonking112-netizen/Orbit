import { useState } from 'react';
import { ArrowLeft, ArrowUp, Check, ChevronDown, ChevronRight, FileSpreadsheet, FileText, Link2, MoreHorizontal, Paperclip, Plus, Search, Sparkles, X } from 'lucide-react';
import usePersistentState from '../hooks/usePersistentState.js';

const progress = ['Understanding request', 'Searching sources', 'Comparing options', 'Preparing recommendation'];
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

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromPrompt(text, type) {
  const cleaned = text.replace(/^(please\s+)?(create|draft|write|make|build)\s+(me\s+)?(a|an)?\s*/i, '').trim();
  const short = cleaned.split(/[.!?\n]/)[0].trim();
  if (!short) return type === 'Document' ? 'Untitled document' : 'Untitled spreadsheet';
  return short.length > 42 ? `${short.slice(0, 39).trim()}…` : short[0].toUpperCase() + short.slice(1);
}

export default function TaskChatPage({ navigate, showNotice }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = usePersistentState('orbit:v1:chat-messages', []);
  const [canvas, setCanvas] = usePersistentState('orbit:v1:canvas', initialCanvas);
  const [plusOpen, setPlusOpen] = useState(false);

  const send = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setSent((all) => [...all, { id: makeId(), text, createdAt: new Date().toISOString() }]);
    if (canvas.enabled) {
      setCanvas((current) => {
        const revision = current.revision + 1;
        const title = current.revision === 0 ? titleFromPrompt(text, current.type) : current.title;
        if (current.type === 'Spreadsheet') {
          return { ...current, prompt: text, title, revision, rows: [...current.rows, [`Update ${revision}`, text, 'Draft']] };
        }
        const addition = current.revision === 0 ? `Request: ${text}\n\nLocal draft notes:\n- Outline the key sections\n- Add supporting details\n- Review and refine` : `\n\nFollow-up ${revision}: ${text}`;
        return { ...current, prompt: text, title, revision, content: `${current.content}${current.content ? '\n\n' : ''}${addition}` };
      });
      showNotice('Canvas preview updated locally. No AI request was sent.');
    } else {
      showNotice('Message saved in this browser only. No AI request was sent.');
    }
    setMessage('');
  };

  const enableCanvas = () => {
    setCanvas((current) => ({ ...current, enabled: true }));
    setPlusOpen(false);
    showNotice('Canvas mode enabled for this chat.');
  };
  const disableCanvas = () => setCanvas((current) => ({ ...current, enabled: false }));
  const updateCanvas = (patch) => setCanvas((current) => ({ ...current, ...patch }));
  const addSheetRow = () => setCanvas((current) => ({ ...current, rows: [...current.rows, ['', '', '']] }));
  const removeSheetRow = (index) => setCanvas((current) => ({ ...current, rows: current.rows.filter((_, rowIndex) => rowIndex === 0 || rowIndex !== index) }));
  const updateSheetCell = (rowIndex, cellIndex, value) => setCanvas((current) => ({ ...current, rows: current.rows.map((row, currentRow) => currentRow === rowIndex ? row.map((cell, currentCell) => currentCell === cellIndex ? value : cell) : row) }));

  return <div className="split-page chat-page">
    <section className="page-content conversation-content">
      <div className="conversation-heading"><button className="back-link" onClick={() => navigate('/tasks')}><ArrowLeft size={16} /> Tasks</button><div className="conversation-title"><span className="live-pulse" /><div><h1>Comparing project tools</h1><p>Sample task <span>·</span> Saved in this browser</p></div></div><button className="dots-button" aria-label="Conversation options" onClick={() => showNotice('This is a local chat preview; no remote conversation is connected.')}><MoreHorizontal size={18} /></button></div>
      <div className="conversation-demo-note">Sample conversation preview — messages are stored locally; no AI response is running.</div>
      <div className="conversation-stream">
        <div className="user-message"><p>Compare the best project management tools for a small remote team and recommend one.</p><small>Sample request · prototype</small></div>
        <div className="agent-message"><div className="agent-avatar"><Sparkles size={17} /></div><div className="agent-message-body"><div className="agent-label">Orbit <span>sample response</span></div><p>This sample layout shows how a research update and recommendation could appear. Connect an AI service later to generate real task results.</p><div className="source-chips"><span><Search size={13} /> Sample research</span><span><FileText size={13} /> Demo sources</span></div><div className="working-card"><div className="working-card-head"><span><span className="live-pulse small-pulse" /> Example task progress</span><small>Sample</small></div><div className="working-progress"><span /></div><p>Static progress example — the prototype is not searching or running a task.</p></div></div></div>
        {sent.map((item) => <div className="user-message new-message" key={item.id}><p>{item.text}</p><small>You · saved locally</small></div>)}
        {canvas.enabled && <CanvasWorkbench canvas={canvas} updateCanvas={updateCanvas} addSheetRow={addSheetRow} removeSheetRow={removeSheetRow} updateSheetCell={updateSheetCell} />}
      </div>
      <form className="composer" onSubmit={send}>
        {canvas.enabled && <div className="canvas-mode-chip"><span className="canvas-chip-icon"><FileText size={13} /></span><span>Canvas mode <small>· {canvas.type}</small></span><button type="button" onClick={disableCanvas} aria-label="Turn off Canvas mode"><X size={13} /></button></div>}
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={canvas.enabled ? `Describe an update to the ${canvas.type.toLowerCase()}…` : 'Message Orbit or add instructions…'} rows={1} aria-label="Message Orbit" />
        <div className="composer-actions"><div className="composer-tools"><div className="composer-plus-wrap"><button type="button" className={`composer-plus ${plusOpen ? 'active' : ''}`} onClick={() => setPlusOpen((open) => !open)} aria-label="Add a tool or file" aria-expanded={plusOpen}><Plus size={17} /></button>{plusOpen && <div className="composer-plus-menu"><button type="button" className="plus-menu-item" onClick={enableCanvas}><span className="plus-menu-icon canvas-menu-icon"><FileText size={16} /></span><span><b>Create with Canvas</b><small>Draft a document or spreadsheet in chat</small></span></button><button type="button" className="plus-menu-item" onClick={() => { setPlusOpen(false); showNotice('File attachments are not connected in this local prototype.'); }}><span className="plus-menu-icon attach-menu-icon"><Paperclip size={16} /></span><span><b>Attach a file</b><small>Attachment support can be added with storage later</small></span></button></div>}</div><span className="composer-hint">{canvas.enabled ? 'Local editable preview · no AI call' : 'Messages stay in this browser'}</span></div><button className="send-button" type="submit" aria-label="Save message"><ArrowUp size={17} /></button></div>
      </form>
    </section>
    <aside className="inspector chat-inspector"><div className="inspector-title"><h2>Task progress</h2><span className="demo-badge">SAMPLE</span></div><div className="progress-summary"><div className="summary-icon"><Sparkles size={16} /></div><div><b>Comparing project tools</b><small>Static research preview · not running</small></div></div><div className="review-panel"><span className="review-shield">✓</span><span><b>Review before sending</b><small>Approval example shown for UI only; nothing will be sent externally.</small></span><ChevronRight size={15} /></div><div className="task-timeline">{progress.map((step, index) => <div key={step} className={`timeline-step ${index < 1 ? 'complete' : index === 1 ? 'current' : ''}`}><span className="timeline-marker">{index < 1 && <Check size={11} />}</span><span>{step}</span>{index === 1 && <small>Sample</small>}</div>)}</div><div className="source-section"><div className="source-section-title"><b>Sources</b><span>Demo</span></div><div className="source-item"><span className="source-type web-source"><Link2 size={14} /></span><span><b>Project management tools</b><small>Sample source card</small></span><ChevronRight size={14} /></div><div className="source-item"><span className="source-type file-source"><FileText size={14} /></span><span><b>Team requirements</b><small>Sample workspace file</small></span><ChevronRight size={14} /></div></div><div className="task-inspector-footer"><span className="avatar">JD</span><span><b>Jordan Diaz</b><small>Workspace member · sample</small></span></div></aside>
  </div>;
}

function CanvasWorkbench({ canvas, updateCanvas, addSheetRow, removeSheetRow, updateSheetCell }) {
  const isSheet = canvas.type === 'Spreadsheet';
  return <section className="canvas-workbench" aria-label="Canvas file workspace">
    <div className="canvas-workbench-header"><div className="canvas-heading"><span className="canvas-icon">{isSheet ? <FileSpreadsheet size={16} /> : <FileText size={16} />}</span><span><b>Canvas · local draft</b><small>{canvas.revision ? `${canvas.revision} prompt update${canvas.revision === 1 ? '' : 's'} · editable below` : 'Choose a type and start a draft'}</small></span></div><label className="canvas-type-select"><select value={canvas.type} onChange={(event) => updateCanvas({ type: event.target.value })} aria-label="Canvas file type"><option>Document</option><option>Spreadsheet</option></select><ChevronDown size={13} /></label></div>
    <div className={`canvas-sheet-preview ${isSheet ? 'spreadsheet-preview' : ''}`}>
      <div className="canvas-paper-label">{canvas.revision ? 'LOCAL DRAFT · NOT AI-GENERATED' : 'CANVAS DRAFT PREVIEW'}</div>
      <input className="canvas-title-input" aria-label="Canvas file title" value={canvas.title} maxLength={80} onChange={(event) => updateCanvas({ title: event.target.value })} />
      {isSheet ? <>
        <div className="canvas-editable-grid">{canvas.rows.map((row, rowIndex) => <div className={`canvas-editable-row ${rowIndex === 0 ? 'header-row' : ''}`} key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => <input key={`cell-${rowIndex}-${cellIndex}`} aria-label={`Row ${rowIndex + 1}, column ${cellIndex + 1}`} value={cell} onChange={(event) => updateSheetCell(rowIndex, cellIndex, event.target.value)} />)}{rowIndex > 0 && <button className="remove-sheet-row" aria-label={`Remove row ${rowIndex}`} onClick={() => removeSheetRow(rowIndex)}><X size={12} /></button>}</div>)}</div>
        <button className="canvas-add-row" onClick={addSheetRow}><Plus size={13} /> Add row</button>
      </> : <>
        <textarea className="canvas-document-editor" aria-label="Canvas document draft" value={canvas.content} onChange={(event) => updateCanvas({ content: event.target.value })} placeholder="Type a local draft here, or send a prompt in the chat to add a draft outline…" />
        {canvas.prompt && <div className="canvas-last-prompt"><Sparkles size={13} /><span>Latest prompt: {canvas.prompt}</span></div>}
      </>}
    </div>
    <div className="canvas-workbench-footer"><span className="canvas-draft-status drafting"><span />Saved in this browser · no AI request</span><button type="button" onClick={() => document.querySelector('.canvas-title-input')?.focus()}>Edit draft <ChevronRight size={13} /></button></div>
  </section>;
}
