import { useMemo, useRef, useState } from 'react';
import { File, FileSpreadsheet, FileText, Folder, Grid2X2, List, MoreHorizontal, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import usePersistentState from '../hooks/usePersistentState.js';

const initialFiles = [
  { id: 'brand-guidelines', name: 'Brand guidelines.pdf', type: 'PDF document', date: 'Updated yesterday', kind: 'pdf', size: '2.4 MB', source: 'sample' },
  { id: 'product-roadmap', name: 'Product roadmap.docx', type: 'Word document', date: 'Updated May 12', kind: 'doc', size: '840 KB', source: 'sample' },
  { id: 'customer-interviews', name: 'Customer interview notes.pdf', type: 'PDF document', date: 'Updated May 10', kind: 'pdf', size: '1.1 MB', source: 'sample' },
  { id: 'market-research', name: 'Market research.xlsx', type: 'Spreadsheet', date: 'Updated May 8', kind: 'sheet', size: '520 KB', source: 'sample' },
];

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `file-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function kindFor(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (['xlsx', 'xls', 'csv', 'ods'].includes(extension)) return 'sheet';
  if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(extension)) return 'doc';
  return 'pdf';
}

function typeFor(kind, fileName = '') {
  if (kind === 'sheet') return 'Spreadsheet';
  if (kind === 'doc') return fileName.endsWith('.txt') || fileName.endsWith('.md') ? 'Text document' : 'Word document';
  return 'PDF document';
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function makeBlankFile(kind, files) {
  const noun = kind === 'sheet' ? 'spreadsheet' : 'document';
  const count = files.filter((file) => file.source === 'blank' && file.kind === kind).length + 1;
  return {
    id: makeId(),
    name: count === 1 ? `Untitled ${noun}` : `Untitled ${noun} ${count}`,
    type: kind === 'sheet' ? 'Spreadsheet' : 'Document',
    date: 'Created just now',
    kind,
    size: 'Local draft',
    source: 'blank',
    content: kind === 'sheet' ? 'Item,Details,Status\nResearch,Sources and notes,Planned\nSummary,Key findings,In progress' : '',
  };
}

export default function LibraryPage({ showNotice }) {
  const [files, setFiles] = usePersistentState('orbit:v1:library', initialFiles);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All files');
  const [view, setView] = useState('grid');
  const [dragging, setDragging] = useState(false);
  const [menuId, setMenuId] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pickerRef = useRef(null);

  const visible = useMemo(() => files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'All files' || (filter === 'Documents' && file.kind !== 'sheet') || (filter === 'Spreadsheets' && file.kind === 'sheet'))), [files, query, filter]);

  const addLocalFiles = (fileList) => {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;
    const additions = selected.map((file) => {
      const kind = kindFor(file);
      return { id: makeId(), name: file.name, type: typeFor(kind, file.name), date: 'Added just now', kind, size: formatBytes(file.size), source: 'local-file' };
    });
    setFiles((all) => [...additions, ...all]);
    showNotice(`${additions.length} file${additions.length === 1 ? '' : 's'} added to this browser’s library. File contents were not uploaded.`);
  };

  const handlePicker = (event) => {
    addLocalFiles(event.target.files);
    event.target.value = '';
  };

  const createBlank = (kind) => {
    const file = makeBlankFile(kind, files);
    setFiles((all) => [file, ...all]);
    setPreviewFile(file);
    showNotice(`${kind === 'sheet' ? 'Spreadsheet' : 'Document'} preview created locally.`);
  };

  const updateDraft = (fileId, patch) => {
    setFiles((all) => all.map((file) => file.id === fileId ? { ...file, ...patch } : file));
    setPreviewFile((current) => current?.id === fileId ? { ...current, ...patch } : current);
  };

  const removeFile = () => {
    if (!deleteTarget) return;
    setFiles((all) => all.filter((file) => file.id !== deleteTarget.id));
    if (previewFile?.id === deleteTarget.id) setPreviewFile(null);
    showNotice(`${deleteTarget.name} removed from this browser’s library.`);
    setDeleteTarget(null);
    setMenuId('');
  };

  return <section className="page-content library-page">
    <div className="page-title-row library-title-row"><div><h1>Library</h1><p className="page-subtitle">Files and knowledge for your workspace</p></div><button className="primary-button" onClick={() => pickerRef.current?.click()}><Upload size={16} /> Upload files</button></div>
    <div className="library-local-note">Files and drafts stay in this browser. Uploaded file contents are not sent to a server in this prototype.</div>
    <div className="library-toolbar"><div className="search-box"><Search size={16} /><input aria-label="Search files" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files and folders" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</div><div className="filter-control"><span>Type</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All files</option><option>Documents</option><option>Spreadsheets</option></select></div><div className="view-switch"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><Grid2X2 size={16} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={16} /></button></div></div>
    <input ref={pickerRef} className="visually-hidden-input" type="file" multiple onChange={handlePicker} />
    <div className={`dropzone ${dragging ? 'dragging' : ''}`} onClick={() => pickerRef.current?.click()} role="button" tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && pickerRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addLocalFiles(event.dataTransfer.files); }}>
      <div className="upload-cloud"><Upload size={19} /></div><div><b>Drop files here to add them to your library</b><span>or <u>browse files</u> from your device</span></div>
    </div>
    <div className="library-section-heading"><div><h2>Recent files</h2><p>{files.length} local item{files.length === 1 ? '' : 's'} in this browser.</p></div><button className="text-button" onClick={() => { setFilter('All files'); setQuery(''); }}>View all <span>→</span></button></div>
    <div className={`file-grid ${view === 'list' ? 'list-view' : ''}`}>
      {visible.map((file) => <article className="file-card" key={file.id}>
        <button type="button" className="file-open-button" onClick={() => setPreviewFile(file)} aria-label={`Open ${file.name} preview`}>
          <div className={`file-preview ${file.kind}`}><FileIcon kind={file.kind} /><span className="preview-line long" /><span className="preview-line" /><span className="preview-line short" /></div>
          <div className="file-card-copy"><span className={`file-kind ${file.kind}`}>{file.type}</span><h3>{file.name}</h3><p>{file.date} <span>·</span> {file.size}</p></div>
        </button>
        <button type="button" className="dots-button file-menu" aria-label={`More options for ${file.name}`} onClick={() => setMenuId(menuId === file.id ? '' : file.id)}><MoreHorizontal size={17} /></button>
        {menuId === file.id && <div className="inline-menu file-inline-menu"><button onClick={() => { setPreviewFile(file); setMenuId(''); }}>Open preview</button><button className="danger-menu-item" onClick={() => { setDeleteTarget(file); setMenuId(''); }}>Delete file</button></div>}
      </article>)}
      {visible.length === 0 && <div className="empty-state"><Folder size={22} /><b>{files.length ? 'No files match your search' : 'Your library is empty'}</b><span>{files.length ? 'Try another search or file type.' : 'Upload a local file or create a blank draft to get started.'}</span></div>}
    </div>
    <div className="quick-create"><span className="quick-create-title">Create a new file</span><button onClick={() => createBlank('doc')}><span className="create-icon doc-create"><FileText size={17} /></span><span><b>Document</b><small>Start with a local blank draft</small></span><Plus size={16} /></button><button onClick={() => createBlank('sheet')}><span className="create-icon sheet-create"><FileSpreadsheet size={17} /></span><span><b>Spreadsheet</b><small>Organize information locally</small></span><Plus size={16} /></button></div>

    {previewFile && <div className="modal-backdrop" onMouseDown={() => setPreviewFile(null)}><div className="modal-card library-preview-modal" onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" aria-label="Close preview" onClick={() => setPreviewFile(null)}><X size={19} /></button><div className="modal-icon"><FileIcon kind={previewFile.kind} /></div>
      <span className="preview-type-overline">{previewFile.type} · {previewFile.size}</span><h2>{previewFile.name}</h2>
      {previewFile.source === 'blank' ? <><p>Edit a local draft below. It is stored in this browser only.</p><textarea className="local-file-editor" value={previewFile.content || ''} onChange={(event) => updateDraft(previewFile.id, { content: event.target.value })} placeholder={previewFile.kind === 'sheet' ? 'Item,Details,Status' : 'Start writing your document…'} /></> : <div className="file-metadata-note"><FileText size={16} /><span>This preview stores only the filename and file metadata. The original file contents remain on your device and were not uploaded.</span></div>}
      <div className="preview-modal-footer"><span>Local browser preview</span><button className="secondary-button" onClick={() => setPreviewFile(null)}>Done</button></div>
    </div></div>}

    {deleteTarget && <div className="modal-backdrop" onMouseDown={() => setDeleteTarget(null)}><div className="modal-card confirm-modal" onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" aria-label="Close" onClick={() => setDeleteTarget(null)}><X size={19} /></button><div className="modal-icon warning-icon"><Trash2 size={19} /></div><h2>Remove this file?</h2><p>“{deleteTarget.name}” will be removed from this browser’s library. A source file on your device is not affected.</p><div className="confirm-actions"><button className="secondary-button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger-button" onClick={removeFile}>Remove</button></div>
    </div></div>}
  </section>;
}

function FileIcon({ kind }) {
  if (kind === 'sheet') return <FileSpreadsheet size={19} />;
  if (kind === 'doc') return <FileText size={19} />;
  return <File size={19} />;
}
