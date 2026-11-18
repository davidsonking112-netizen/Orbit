import { useMemo, useState } from 'react';
import { ArrowRight, FileImage, Images, LayoutTemplate, Plus, Presentation, Search, Sparkles, WandSparkles } from 'lucide-react';

const presentations = [
  { title: 'Quarterly product update', meta: '8 slides · Edited yesterday', theme: 'blue' },
  { title: 'Remote team onboarding', meta: '12 slides · Edited May 12', theme: 'green' },
  { title: 'Market overview', meta: '6 slides · Edited May 8', theme: 'violet' },
];
const imageItems = [
  { title: 'Product launch concept', meta: 'Preview visual · May 16', theme: 'image-sunset' },
  { title: 'Team workspace moodboard', meta: 'Preview visual · May 14', theme: 'image-green' },
  { title: 'Campaign direction', meta: 'Preview visual · May 10', theme: 'image-violet' },
];

export default function SlidesImagesPage({ showNotice }) {
  const [view, setView] = useState('Presentations');
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [items, setItems] = useState(presentations);
  const [images, setImages] = useState(imageItems);
  const activeItems = view === 'Presentations' ? items : images;
  const visibleItems = useMemo(() => activeItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [activeItems, query]);
  const create = (e) => {
    e.preventDefault();
    const description = prompt.trim();
    if (!description) { showNotice(`Describe a ${view === 'Presentations' ? 'presentation' : 'visual'} first.`); return; }
    const newItem = { title: description.slice(0, 42), meta: 'Local preview · Just now', theme: view === 'Presentations' ? 'blue' : 'image-violet' };
    if (view === 'Presentations') setItems((all) => [newItem, ...all]);
    else setImages((all) => [newItem, ...all]);
    showNotice(`A local ${view === 'Presentations' ? 'slide' : 'image'} preview card was added. No AI credits were used.`);
    setPrompt('');
  };
  return <section className="page-content slides-images-page">
    <div className="page-title-row"><div><h1>Slides &amp; images</h1><p className="page-subtitle">Create visual work and preview it in your workspace</p></div><button className="primary-button" onClick={() => { setView('Presentations'); document.getElementById('visual-prompt')?.focus(); }}><Plus size={16} /> Create presentation</button></div>
    <div className="visual-tabs" role="tablist" aria-label="Visual work type"><button role="tab" aria-selected={view === 'Presentations'} className={view === 'Presentations' ? 'active' : ''} onClick={() => setView('Presentations')}><Presentation size={15} /> Presentations</button><button role="tab" aria-selected={view === 'Images'} className={view === 'Images' ? 'active' : ''} onClick={() => setView('Images')}><Images size={15} /> Images</button></div>
    <div className="visual-create-card"><div className="visual-create-icon"><WandSparkles size={19} /></div><div className="visual-create-copy"><h2>{view === 'Presentations' ? 'Create a presentation' : 'Create an image'}</h2><p>{view === 'Presentations' ? 'Describe your presentation and preview a draft in Orbit.' : 'Describe an image to add it to your visual library.'}</p></div><form className="visual-prompt-form" onSubmit={create}><div className="visual-prompt-input"><Sparkles size={15} /><input id="visual-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={view === 'Presentations' ? 'e.g. A 6-slide product update for our team…' : 'e.g. A calm abstract cover image in teal…'} /><button type="submit" aria-label="Create preview"><ArrowRight size={17} /></button></div><div className="visual-options"><button type="button" onClick={() => showNotice('Template choices are a prototype affordance.')}><LayoutTemplate size={13} /> Choose a template</button><span>Local preview only · no generation credits used</span></div></form></div>
    <div className="visual-library-heading"><div><h2>{view === 'Presentations' ? 'Recent presentations' : 'Recent images'}</h2><p>{view === 'Presentations' ? 'Open a presentation to see its slide previews.' : 'Your visual assets, organized in one place.'}</p></div><div className="search-box visual-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${view.toLowerCase()}`} aria-label={`Search ${view.toLowerCase()}`} /></div></div>
    <div className={`visual-grid ${view === 'Images' ? 'image-grid' : ''}`}>{visibleItems.map((item, i) => <article className="visual-card" key={`${item.title}-${i}`} onClick={() => showNotice(`${item.title} preview opened.`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && showNotice(`${item.title} preview opened.`)}><div className={`visual-preview ${item.theme}`}>{view === 'Presentations' ? <SlidePreview theme={item.theme} /> : <div className="image-art"><span /><i /><b /></div>}<span className="visual-preview-badge">{view === 'Presentations' ? 'SLIDES' : 'IMAGE'}</span></div><div className="visual-card-info"><span className="visual-type-label">{view === 'Presentations' ? 'PRESENTATION' : 'VISUAL ASSET'}</span><h3>{item.title}</h3><p>{item.meta}</p></div><ArrowRight size={15} className="visual-card-arrow" /></article>)}</div>
    {visibleItems.length === 0 && <div className="visual-empty"><FileImage size={21} /><b>No {view.toLowerCase()} found</b><span>Try another search.</span></div>}
  </section>;
}

function SlidePreview({ theme }) {
  return <div className={`slide-stack ${theme}`}><div className="mini-slide slide-one"><span className="mini-kicker" /><span className="mini-title" /><span className="mini-line" /><span className="mini-shape" /></div><div className="mini-slide slide-two"><span className="mini-kicker" /><span className="mini-title" /><span className="mini-line" /><span className="mini-shape" /></div><div className="mini-slide slide-three"><span className="mini-kicker" /><span className="mini-title" /><span className="mini-line" /><span className="mini-shape" /></div></div>;
}
