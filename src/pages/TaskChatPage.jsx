import { useState } from 'react';
import { ArrowLeft, ArrowUp, Check, ChevronDown, ChevronRight, FileSpreadsheet, FileText, Link2, MoreHorizontal, Paperclip, Plus, Search, Sparkles, X } from 'lucide-react';

const progress = ['Understanding request', 'Searching sources', 'Comparing options', 'Preparing recommendation'];
export default function TaskChatPage({ navigate, showNotice }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const [canvasMode, setCanvasMode] = useState(false);
  const [canvasType, setCanvasType] = useState('Document');
  const [canvasPrompt, setCanvasPrompt] = useState('');
  const send = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    setSent((all) => [...all, text]);
    if (canvasMode) setCanvasPrompt(text);
    setMessage('');
  };
  const enableCanvas = () => { setCanvasMode(true); setPlusOpen(false); };
  const disableCanvas = () => { setCanvasMode(false); setCanvasPrompt(''); };

  return <div className="split-page chat-page"><section className="page-content conversation-content"><div className="conversation-heading"><button className="back-link" onClick={() => navigate('/tasks')}><ArrowLeft size={16} /> Tasks</button><div className="conversation-title"><span className="live-pulse" /><div><h1>Comparing project tools</h1><p>Started a few minutes ago <span>·</span> Research task</p></div></div><button className="dots-button"><MoreHorizontal size={18} /></button></div>
    <div className="conversation-stream"><div className="user-message"><p>Compare the best project management tools for a small remote team and recommend one.</p><small>You · 2 min ago</small></div>
      <div className="agent-message"><div className="agent-avatar"><Sparkles size={17} /></div><div className="agent-message-body"><div className="agent-label">Orbit <span>working</span></div><p>I’m comparing a few options based on ease of use, collaboration features, and value for a small remote team. I’ll share a concise recommendation when I’m done.</p><div className="source-chips"><span><Search size={13} /> Web research</span><span><FileText size={13} /> 3 sources</span></div><div className="working-card"><div className="working-card-head"><span><span className="live-pulse small-pulse" /> Researching options</span><small>In progress</small></div><div className="working-progress"><span /></div><p>Looking at pricing, async collaboration, and setup effort.</p></div></div></div>
      {sent.map((text, i) => <div className="user-message new-message" key={`${text}-${i}`}><p>{text}</p><small>You · just now</small></div>)}
      {canvasMode && <CanvasWorkbench type={canvasType} setType={setCanvasType} prompt={canvasPrompt} />}
    </div>
    <form className="composer" onSubmit={send}>
      {canvasMode && <div className="canvas-mode-chip"><span className="canvas-chip-icon"><FileText size={13} /></span><span>Canvas mode <small>· {canvasType}</small></span><button type="button" onClick={disableCanvas} aria-label="Turn off Canvas mode"><X size={13} /></button></div>}
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={canvasMode ? `Describe the ${canvasType.toLowerCase()} to create in Canvas…` : 'Message Orbit or add instructions…'} rows={1} />
      <div className="composer-actions"><div className="composer-tools"><div className="composer-plus-wrap"><button type="button" className={`composer-plus ${plusOpen ? 'active' : ''}`} onClick={() => setPlusOpen((open) => !open)} aria-label="Add a tool or file"><Plus size={17} /></button>{plusOpen && <div className="composer-plus-menu"><button type="button" className="plus-menu-item" onClick={enableCanvas}><span className="plus-menu-icon canvas-menu-icon"><FileText size={16} /></span><span><b>Create with Canvas</b><small>Draft a document or spreadsheet in chat</small></span></button><button type="button" className="plus-menu-item" onClick={() => { setPlusOpen(false); showNotice('File attachment is a prototype affordance.'); }}><span className="plus-menu-icon attach-menu-icon"><Paperclip size={16} /></span><span><b>Attach a file</b><small>Add a reference for this task</small></span></button></div>}</div><span className="composer-hint">{canvasMode ? 'Orbit will create the file in Canvas' : 'Orbit is working on this task'}</span></div><button className="send-button" type="submit" aria-label="Send message"><ArrowUp size={17} /></button></div>
    </form>
    </section><aside className="inspector chat-inspector"><div className="inspector-title"><h2>Task progress</h2><button className="dots-button"><MoreHorizontal size={18} /></button></div><div className="progress-summary"><div className="summary-icon"><Sparkles size={16} /></div><div><b>Comparing project tools</b><small>Research and recommendation</small></div></div><div className="review-panel"><span className="review-shield">✓</span><span><b>Review before sending</b><small>Orbit will ask before sharing anything externally.</small></span><ChevronRight size={15} /></div><div className="task-timeline">{progress.map((step, i) => <div key={step} className={`timeline-step ${i < 1 ? 'complete' : i === 1 ? 'current' : ''}`}><span className="timeline-marker">{i < 1 && <Check size={11} />}</span><span>{step}</span>{i === 1 && <small>Now</small>}</div>)}</div><div className="source-section"><div className="source-section-title"><b>Sources</b><span>3</span></div><div className="source-item"><span className="source-type web-source"><Link2 size={14} /></span><span><b>Project management tools</b><small>Web search · 2 sources</small></span><ChevronRight size={14} /></div><div className="source-item"><span className="source-type file-source"><FileText size={14} /></span><span><b>Team requirements</b><small>Workspace file · 1 source</small></span><ChevronRight size={14} /></div></div><div className="task-inspector-footer"><span className="avatar">JD</span><span><b>Jordan Diaz</b><small>Workspace member</small></span></div></aside></div>;
}

function CanvasWorkbench({ type, setType, prompt }) {
  const ready = Boolean(prompt);
  const title = ready ? (type === 'Document' ? 'Project brief' : 'Team comparison') : `New ${type.toLowerCase()}`;
  return <section className="canvas-workbench" aria-label="Canvas file workspace">
    <div className="canvas-workbench-header"><div className="canvas-heading"><span className="canvas-icon"><FileText size={16} /></span><span><b>Canvas</b><small>{ready ? 'Orbit is drafting in your workspace' : 'Ready for your file request'}</small></span></div><label className="canvas-type-select"><select value={type} onChange={(e) => setType(e.target.value)} aria-label="Canvas file type"><option>Document</option><option>Spreadsheet</option></select><ChevronDown size={13} /></label></div>
    <div className={`canvas-sheet-preview ${type === 'Spreadsheet' ? 'spreadsheet-preview' : ''}`}>
      {type === 'Document' ? <><div className="canvas-paper-label">{ready ? 'DRAFT · CANVAS DOCUMENT' : 'CANVAS DOCUMENT PREVIEW'}</div><h3>{title}</h3><p className="canvas-prompt-summary">{ready ? prompt : 'Describe a file in the message box and Orbit will draft it here.'}</p><div className="document-preview-lines"><span className="line-wide" /><span /><span className="line-medium" /><span /><span className="line-short" /></div>{ready && <div className="document-preview-section"><b>Overview</b><p>A clear starting point created from your request. Add a follow-up message to refine this draft.</p></div>}</> : <><div className="canvas-paper-label">{ready ? 'DRAFT · CANVAS SPREADSHEET' : 'CANVAS SPREADSHEET PREVIEW'}</div><h3>{title}</h3><p className="canvas-prompt-summary">{ready ? prompt : 'Ask Orbit to organize information into a spreadsheet.'}</p><div className="sheet-mini-grid"><b>Item</b><b>Details</b><b>Status</b><span>Research</span><span>Sources and notes</span><span>In progress</span><span>Summary</span><span>Key findings</span><span>Planned</span></div></>}
    </div>
    <div className="canvas-workbench-footer"><span className={`canvas-draft-status ${ready ? 'drafting' : ''}`}><span />{ready ? 'Draft ready to refine' : 'Canvas is ready'}</span><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Open Canvas <ChevronRight size={13} /></button></div>
  </section>;
}
