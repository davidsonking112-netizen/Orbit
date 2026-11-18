import { useMemo, useState } from 'react';
import { File, FileSpreadsheet, FileText, Folder, Grid2X2, List, MoreHorizontal, Plus, Search, Upload } from 'lucide-react';

const files = [
  { name: 'Brand guidelines.pdf', type: 'PDF document', date: 'Updated yesterday', kind: 'pdf', size: '2.4 MB' },
  { name: 'Product roadmap.docx', type: 'Word document', date: 'Updated May 12', kind: 'doc', size: '840 KB' },
  { name: 'Customer interview notes.pdf', type: 'PDF document', date: 'Updated May 10', kind: 'pdf', size: '1.1 MB' },
  { name: 'Market research.xlsx', type: 'Spreadsheet', date: 'Updated May 8', kind: 'sheet', size: '520 KB' },
];

export default function LibraryPage({ showNotice }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All files');
  const [view, setView] = useState('grid');
  const visible = useMemo(() => files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'All files' || (filter === 'Documents' && f.kind !== 'sheet') || (filter === 'Spreadsheets' && f.kind === 'sheet'))), [query, filter]);
  const create = (type) => showNotice(`${type} creation is ready to configure.`);
  return <section className="page-content library-page">
    <div className="page-title-row library-title-row"><div><h1>Library</h1><p className="page-subtitle">Files and knowledge for your workspace</p></div><button className="primary-button" onClick={() => create('Upload')}><Upload size={16} /> Upload files</button></div>
    <div className="library-toolbar"><div className="search-box"><Search size={16} /><input aria-label="Search files" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files and folders" />{query && <button onClick={() => setQuery('')}>×</button>}</div><div className="filter-control"><span>Type</span><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All files</option><option>Documents</option><option>Spreadsheets</option></select></div><div className="view-switch"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><Grid2X2 size={16} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view"><List size={16} /></button></div></div>
    <div className="dropzone" onClick={() => create('Upload')} role="button" tabIndex="0" onKeyDown={(e) => e.key === 'Enter' && create('Upload')}><div className="upload-cloud"><Upload size={19} /></div><div><b>Drop files here to add them to your library</b><span>or <u>browse files</u> from your device</span></div></div>
    <div className="library-section-heading"><div><h2>Recent files</h2><p>Your workspace knowledge, all in one place.</p></div><button className="text-button" onClick={() => setFilter('All files')}>View all <span>→</span></button></div>
    <div className={`file-grid ${view === 'list' ? 'list-view' : ''}`}>
      {visible.map((file) => <article className="file-card" key={file.name}><div className={`file-preview ${file.kind}`}><FileIcon kind={file.kind} /><span className="preview-line long" /><span className="preview-line" /><span className="preview-line short" /></div><div className="file-card-copy"><span className={`file-kind ${file.kind}`}>{file.type}</span><h3>{file.name}</h3><p>{file.date} <span>·</span> {file.size}</p></div><button className="dots-button file-menu" aria-label={`More options for ${file.name}`}><MoreHorizontal size={17} /></button></article>)}
      {visible.length === 0 && <div className="empty-state"><Folder size={22} /><b>No files match your search</b><span>Try another search or file type.</span></div>}
    </div>
    <div className="quick-create"><span className="quick-create-title">Create a new file</span><button onClick={() => create('Document')}><span className="create-icon doc-create"><FileText size={17} /></span><span><b>Document</b><small>Start with a blank document</small></span><Plus size={16} /></button><button onClick={() => create('Spreadsheet')}><span className="create-icon sheet-create"><FileSpreadsheet size={17} /></span><span><b>Spreadsheet</b><small>Organize information and data</small></span><Plus size={16} /></button></div>
  </section>;
}

function FileIcon({ kind }) {
  if (kind === 'sheet') return <FileSpreadsheet size={19} />;
  if (kind === 'doc') return <FileText size={19} />;
  return <File size={19} />;
}
