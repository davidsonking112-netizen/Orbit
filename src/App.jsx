import { useEffect, useState } from 'react';
import {
  Archive, Bell, CalendarDays, Check, CheckSquare, ChevronDown, CircleHelp,
  Clock3, Command, Images, Link2, Plus, Settings as SettingsIcon, X,
} from 'lucide-react';
import CommandPalette from './components/CommandPalette.jsx';
import usePersistentState from './hooks/usePersistentState.js';
import { createLocalRun } from './lib/localWorkspaceStore.js';
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

function taskIdFromPath(path) {
  const match = path.match(/^\/task\/([^/?#]+)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/');
  const [notice, setNotice] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [runs, setRuns] = usePersistentState('orbit:v2:runs', []);
  const page = pageFromPath(path);
  const taskId = page === 'task-chat' ? taskIdFromPath(path) : '';
  const safeRuns = Array.isArray(runs) ? runs : [];
  const currentRun = safeRuns.find((run) => run.id === taskId) || null;

  const navigate = (to) => {
    if (to !== window.location.pathname) window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createNewTask = () => {
    const run = createLocalRun();
    setRuns((current) => [run, ...(Array.isArray(current) ? current : [])]);
    navigate(`/task/${encodeURIComponent(run.id)}`);
  };

  const updateRun = (id, update) => setRuns((current) => (Array.isArray(current) ? current : []).map((run) => {
    if (run.id !== id) return run;
    const patch = typeof update === 'function' ? update(run) : update;
    return { ...run, ...patch, id: run.id, updatedAt: new Date().toISOString() };
  }));

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    const onShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onShortcut);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onShortcut);
    };
  }, []);

  const showNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2600);
  };
  const latestRun = safeRuns.reduce((latest, run) => !latest || (run.updatedAt || '') > (latest.updatedAt || '') ? run : latest, null);
  const commands = [
    { id: 'new-task', title: 'New task', description: 'Start a fresh local run preview', icon: Plus, action: createNewTask },
    { id: 'schedules', title: 'Schedules & automations', description: 'Open recurring and triggered workflows', icon: CalendarDays, action: () => navigate('/tasks') },
    { id: 'library', title: 'Library', description: 'Open local files and drafts', icon: Archive, action: () => navigate('/library') },
    { id: 'slides-images', title: 'Slides & images', description: 'Open presentation and image previews', icon: Images, action: () => navigate('/slides-images') },
    { id: 'integrations', title: 'Integrations', description: 'Review local demo connection switches', icon: Link2, action: () => navigate('/integrations') },
    { id: 'settings', title: 'Settings', description: 'Manage preferences and local workspace data', icon: SettingsIcon, action: () => navigate('/settings') },
    ...(latestRun ? [{ id: 'latest-run', title: `Continue: ${latestRun.title || 'Local task'}`, description: 'Reopen the most recently updated local run', icon: Clock3, action: () => navigate(`/task/${encodeURIComponent(latestRun.id)}`) }] : []),
  ];
  const title = page === 'library' ? 'Library'
    : page === 'slides-images' ? 'Slides & images'
      : page === 'integrations' ? 'Integrations'
        : page === 'settings' ? 'Settings'
          : page === 'task-chat' ? (currentRun?.title || (taskId === 'compare' ? 'Comparing project tools' : 'New task'))
            : 'Orbit';

  return <div className="app-shell">
    <header className="topbar">
      <div className="topbar-left"><div className="orbit-wordmark"><OrbitMark /><span>Orbit</span></div><div className="topbar-divider" /><div className="workspace-tab"><OrbitMark small /><span>{title}</span><button className="tab-x" aria-label="Close tab" onClick={() => navigate('/tasks')}><X size={14} /></button></div><button className="icon-btn add-tab" aria-label="Open schedules" onClick={() => navigate('/tasks')}><Plus size={20} /></button></div>
      <div className="topbar-right"><button className="icon-btn help-button" title="Help" onClick={() => showNotice('Use the sidebar or Ctrl/Cmd+K to move around Orbit.')}><CircleHelp size={18} /></button><button className="shortcut" onClick={() => setPaletteOpen(true)} aria-label="Open command palette"><Command size={13} /> K</button><button className="avatar-button" aria-label="Account menu" onClick={() => navigate('/settings')}>JD</button><ChevronDown size={15} className="top-chevron" /></div>
    </header>
    <div className="workspace-layout">
      <aside className="sidebar">
        <button className="new-task-button" onClick={createNewTask}><Plus size={17} strokeWidth={2.2} /> New task</button>
        <nav className="primary-nav" aria-label="Main navigation">
          {nav.map(({ id, label, icon: Icon, path: target }) => <button key={id} className={`nav-item ${page === id ? 'selected' : ''}`} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(target)}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></button>)}
        </nav>
      </aside>
      <main className={`main-stage ${page === 'tasks' || page === 'task-chat' ? 'with-inspector' : ''}`}>
        {page === 'tasks' && <TasksPage navigate={navigate} showNotice={showNotice} />}
        {page === 'library' && <LibraryPage showNotice={showNotice} />}
        {page === 'slides-images' && <SlidesImagesPage showNotice={showNotice} />}
        {page === 'integrations' && <IntegrationsPage showNotice={showNotice} />}
        {page === 'settings' && <SettingsPage showNotice={showNotice} />}
        {page === 'task-chat' && <TaskChatPage key={taskId || 'missing-task'} runId={taskId} run={currentRun} updateRun={updateRun} createNewTask={createNewTask} navigate={navigate} showNotice={showNotice} />}
      </main>
    </div>
    {notice && <div className="toast" role="status"><Check size={16} />{notice}</div>}
    <button className="feedback-pill" onClick={() => showNotice('Thanks for sharing feedback.')}><span className="feedback-bubble">▢</span> Feedback</button>
    <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} />
  </div>;
}

function OrbitMark({ small = false }) {
  return <span className={`orbit-mark ${small ? 'mark-small' : ''}`} aria-hidden="true"><i /><b /><em /></span>;
}

export { OrbitMark };
