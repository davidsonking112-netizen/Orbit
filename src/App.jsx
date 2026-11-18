import { useEffect, useState } from 'react';
import {
  Activity, Archive, ArrowDownToLine, ArrowLeft, ArrowRight, Bell, CalendarDays,
  Check, CheckSquare, ChevronDown, ChevronRight, CircleHelp, Clock3, CloudUpload,
  Command, File, FileSpreadsheet, FileText, Filter, Folder, Grid2X2, HardDrive,
  Link2, LockKeyhole, Mail, MoreHorizontal, Plus, Search, Send, Settings as SettingsIcon,
  ShieldCheck, SlidersHorizontal, Sparkles, ToggleLeft, Upload, UserRound, X, Images,
} from 'lucide-react';
import TasksPage from './pages/TasksPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import IntegrationsPage from './pages/IntegrationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SlidesImagesPage from './pages/SlidesImagesPage.jsx';
import TaskChatPage from './pages/TaskChatPage.jsx';

const nav = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 'library', label: 'Library', icon: Archive, path: '/library' },
  { id: 'slides-images', label: 'Slides & images', icon: Images, path: '/slides-images' },
  { id: 'integrations', label: 'Integrations', icon: Link2, path: '/integrations' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

function pageFromPath(path) {
  if (path.startsWith('/task/')) return 'task-chat';
  if (path === '/library') return 'library';
  if (path === '/slides-images') return 'slides-images';
  if (path === '/integrations') return 'integrations';
  if (path === '/settings') return 'settings';
  return 'tasks';
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/');
  const [notice, setNotice] = useState('');
  const page = pageFromPath(path);
  const navigate = (to) => {
    if (to !== window.location.pathname) window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const showNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2600);
  };
  const title = page === 'library' ? 'Library' : page === 'slides-images' ? 'Slides & images' : page === 'integrations' ? 'Integrations' : page === 'settings' ? 'Settings' : page === 'task-chat' ? 'Comparing project tools' : 'Orbit';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left"><div className="orbit-wordmark"><OrbitMark /><span>Orbit</span></div><div className="topbar-divider" /><div className="workspace-tab"><OrbitMark small /><span>{title}</span><button className="tab-x" aria-label="Close tab"><X size={14} /></button></div><button className="icon-btn add-tab" aria-label="New tab" onClick={() => navigate('/tasks')}><Plus size={20} /></button></div>
        <div className="topbar-right"><button className="icon-btn help-button" title="Help"><CircleHelp size={18} /></button><button className="shortcut"><Command size={13} /> K</button><button className="avatar-button" aria-label="Account menu">JD</button><ChevronDown size={15} className="top-chevron" /></div>
      </header>
      <div className="workspace-layout">
        <aside className="sidebar">
          <button className="new-task-button" onClick={() => navigate('/task/compare')}><Plus size={17} strokeWidth={2.2} /> New task</button>
          <nav className="primary-nav" aria-label="Main navigation">
            {nav.map(({ id, label, icon: Icon, path: target }) => <button key={id} className={`nav-item ${page === id ? 'selected' : ''}`} onClick={() => navigate(target)}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></button>)}
          </nav>
        </aside>
        <main className={`main-stage ${page === 'tasks' || page === 'task-chat' ? 'with-inspector' : ''}`}>
          {page === 'tasks' && <TasksPage navigate={navigate} />}
          {page === 'library' && <LibraryPage showNotice={showNotice} />}
          {page === 'slides-images' && <SlidesImagesPage showNotice={showNotice} />}
          {page === 'integrations' && <IntegrationsPage showNotice={showNotice} />}
          {page === 'settings' && <SettingsPage showNotice={showNotice} />}
          {page === 'task-chat' && <TaskChatPage navigate={navigate} showNotice={showNotice} />}
        </main>
      </div>
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
      <button className="feedback-pill" onClick={() => showNotice('Thanks for sharing feedback.')}><span className="feedback-bubble">▢</span> Feedback</button>
    </div>
  );
}

function OrbitMark({ small = false }) {
  return <span className={`orbit-mark ${small ? 'mark-small' : ''}`} aria-hidden="true"><i /><b /><em /></span>;
}

export { OrbitMark };
