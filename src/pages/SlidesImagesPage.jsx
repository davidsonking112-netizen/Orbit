import { useMemo, useState } from 'react';
import { ArrowRight, FileImage, Images, LayoutTemplate, Plus, Presentation, Search, Sparkles, Trash2, WandSparkles, X } from 'lucide-react';
import usePersistentState from '../hooks/usePersistentState.js';

const initialPresentations = [
  { id: 'product-update', title: 'Quarterly product update', meta: '8 slides · Edited yesterday', theme: 'blue' },
  { id: 'team-onboarding', title: 'Remote team onboarding', meta: '12 slides · Edited May 12', theme: 'green' },
  { id: 'market-overview', title: 'Market overview', meta: '6 slides · Edited May 8', theme: 'violet' },
];
const initialImages = [
  { id: 'product-launch', title: 'Product launch concept', meta: 'Preview visual · May 16', theme: 'image-sunset' },
  { id: 'team-moodboard', title: 'Team workspace moodboard', meta: 'Preview visual · May 14', theme: 'image-green' },
  { id: 'campaign-direction', title: 'Campaign direction', meta: 'Preview visual · May 10', theme: 'image-violet' },
];

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `visual-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function SlidesImagesPage({ showNotice }) {
  const [view, setView] = useState('Presentations');
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [presentations, setPresentations] = usePersistentState('orbit:v1:presentations', initialPresentations);
  const [images, setImages] = usePersistentState('orbit:v1:images', initialImages);
  const [selected, setSelected] = useState(null);
  const isPresentation = view === 'Presentations';
  const activeItems = isPresentation ? presentations : images;
  const visibleItems = useMemo(() => activeItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [activeItems, query]);

  const create = (event) => {
    event.preventDefault();
    const description = prompt.trim();
    if (!description) { showNotice(`Describe a ${isPresentation ? 'presentation' : 'visual'} first.`); return; }
    const item = { id: makeId(), title: description.slice(0, 60), meta: 'Local preview · just now', theme: isPresentation ? 'blue' : 'image-violet' };
    if (isPresentation) setPresentations((all) => [item, ...all]);
    else setImages((all) => [item, ...all]);
    setSelected({ ...item, kind: isPresentation ? 'presentation' : 'image' });
    showNotice(`Local ${isPresentation ? 'slide' : 'image'} preview saved. No generation credits were used.`);
    setPrompt('');
  };

  const removeSelected = () => {
    if (!selected) return;
    if (selected.kind === 'presentation') setPresentations((all) => all.filter((item) => item.id !== selected.id));
    else setImages((all) => all.filter((item) => item.id !== selected.id));
    showNotice(`${selected.title} preview removed from this browser.`);
    setSelected(null);
  };

  const openItem = (item) => setSelected({ ...item, kind: isPresentation ? 'presentation' : 'image' });
  const selectView = (nextView) => { setView(nextView); setQuery(''); setPrompt(''); };

  return <section className="page-content slides-images-page">
    <div className="page-title-row"><div><h1>Slides &amp; images</h1><p className="page-subtitle">Create visual work and preview it in your workspace</p></div><button className="primary-button" onClick={() => { setView('Presentations'); document.getElementById('visual-prompt')?.focus(); }}><Plus size={16} /> Create presentation</button></div>
    <div className="visual-local-note">Preview-only workspace — creation here does not call an AI or image service.</div>
    <div className="visual-tabs" role="tablist" aria-label="Visual work type"><button role="tab" aria-selected={isPresentation} className={isPresentation ? 'active' : ''} onClick={() => selectView('Presentations')}><Presentation size={15} /> Presentations</button><button role="tab" aria-selected={!isPresentation} className={!isPresentation ? 'active' : ''} onClick={() => selectView('Images')}><Images size={15} /> Images</button></div>
    <div className="visual-create-card"><div className="visual-create-icon"><WandSparkles size={19} /></div><div className="visual-create-copy"><h2>{isPresentation ? 'Create a presentation' : 'Create an image preview'}</h2><p>{isPresentation ? 'Describe a deck and add a local preview to your workspace.' : 'Describe a visual and save a local concept card.'}</p></div><form className="visual-prompt-form" onSubmit={create}><div className="visual-prompt-input"><Sparkles size={15} /><input id="visual-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={isPresentation ? 'e.g. A 6-slide product update for our team…' : 'e.g. A calm abstract cover image in teal…'} /><button type="submit" aria-label="Create local preview"><ArrowRight size={17} /></button></div><div className="visual-options"><button type="button" onClick={() => showNotice('Template picker is not connected in this local prototype.')}><LayoutTemplate size={13} /> Choose a template</button><span>Local preview only · no generation credits used</span></div></form></div>
    <div className="visual-library-heading"><div><h2>{isPresentation ? 'Recent presentations' : 'Recent images'}</h2><p>{isPresentation ? 'Open a presentation to preview its sample slides.' : 'Open an image card to see its local concept preview.'}</p></div><div className="search-box visual-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${view.toLowerCase()}`} aria-label={`Search ${view.toLowerCase()}`} />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}</div></div>
    <div className={`visual-grid ${!isPresentation ? 'image-grid' : ''}`}>
      {visibleItems.map((item) => <article className="visual-card" key={item.id}>
        <button className="visual-card-open" onClick={() => openItem(item)} aria-label={`Open ${item.title} preview`}><div className={`visual-preview ${item.theme}`}>{isPresentation ? <SlidePreview theme={item.theme} /> : <div className="image-art"><span /><i /><b /></div>}<span className="visual-preview-badge">{isPresentation ? 'SLIDES' : 'IMAGE'}</span></div><div className="visual-card-info"><span className="visual-type-label">{isPresentation ? 'PRESENTATION PREVIEW' : 'VISUAL CONCEPT'}</span><h3>{item.title}</h3><p>{item.meta}</p></div><ArrowRight size={15} className="visual-card-arrow" /></button>
        <button className="visual-card-delete" aria-label={`Delete ${item.title}`} onClick={() => setSelected({ ...item, kind: isPresentation ? 'presentation' : 'image' })}><Trash2 size={14} /></button>
      </article>)}
    </div>
    {visibleItems.length === 0 && <div className="visual-empty"><FileImage size={21} /><b>No {view.toLowerCase()} found</b><span>{activeItems.length ? 'Try another search.' : 'Create a local preview to get started.'}</span></div>}

    {selected && <div className="modal-backdrop" onMouseDown={() => setSelected(null)}><div className="modal-card visual-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" aria-label="Close preview" onClick={() => setSelected(null)}><X size={19} /></button><div className="modal-icon">{selected.kind === 'presentation' ? <Presentation size={19} /> : <Images size={19} />}</div><span className="preview-type-overline">{selected.kind === 'presentation' ? 'LOCAL PRESENTATION PREVIEW' : 'LOCAL IMAGE CONCEPT'}</span><h2>{selected.title}</h2><p>This is a CSS preview card, not an AI-generated deck or image. Its details are saved in this browser.</p>
      <div className={`visual-detail-art ${selected.theme}`}>{selected.kind === 'presentation' ? <SlidePreview theme={selected.theme} /> : <div className="image-art"><span /><i /><b /></div>}</div>
      {selected.kind === 'presentation' && <div className="slide-outline"><b>Sample outline</b><ol><li>Title and objective</li><li>Key points from your prompt</li><li>Summary and next steps</li></ol></div>}
      <div className="confirm-actions"><button className="secondary-button" onClick={() => setSelected(null)}>Close preview</button><button className="danger-button" onClick={removeSelected}><Trash2 size={14} /> Delete preview</button></div>
    </div></div>}
  </section>;
}

function SlidePreview({ theme }) {
  return <div className={`slide-stack ${theme}`}><div className="mini-slide slide-one"><span className="mini-kicker" /><span className="mini-title" /><span className="mini-line" /><span className="mini-shape" /></div><div className="mini-slide slide-two"><span className="mini-kicker" /><span className="mini-title" /><span className="mini-line" /><span className="mini-shape" /></div><div className="mini-slide slide-three"><span className="mini-kicker" /><span className="mini-title" /><span className="mini-line" /><span className="mini-shape" /></div></div>;
}
