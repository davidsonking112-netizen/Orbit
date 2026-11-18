import { useState } from 'react';
import { Bell, Check, ChevronRight, LockKeyhole, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';

const initialOptions = [
  { title: 'Ask before sending messages', detail: 'Review messages before they leave Orbit.', enabled: true },
  { title: 'Confirm external actions', detail: 'Orbit pauses before making changes in connected tools.', enabled: true },
  { title: 'Use task history for context', detail: 'Let Orbit reference previous tasks in this workspace.', enabled: false },
  { title: 'Data retention', detail: 'Keep your task history available in your workspace.', enabled: true },
];
const sections = [
  { id: 'Profile', icon: UserRound }, { id: 'Preferences', icon: SlidersHorizontal },
  { id: 'Privacy & safety', icon: ShieldCheck }, { id: 'Notifications', icon: Bell },
];

export default function SettingsPage({ showNotice }) {
  const [active, setActive] = useState('Privacy & safety');
  const [options, setOptions] = useState(initialOptions);
  const change = (i) => setOptions((all) => all.map((item, index) => index === i ? { ...item, enabled: !item.enabled } : item));
  return <section className="page-content settings-page">
    <div className="page-title-row"><div><h1>Settings</h1><p className="page-subtitle">Make Orbit work the way you do</p></div><button className="save-button" onClick={() => showNotice('Your preferences are saved in this demo.')}><Check size={15} /> Save changes</button></div>
    <div className="settings-layout"><nav className="settings-nav" aria-label="Settings sections">{sections.map(({ id, icon: Icon }) => <button key={id} className={active === id ? 'selected' : ''} onClick={() => setActive(id)}><Icon size={16} /><span>{id}</span>{active === id && <ChevronRight size={14} />}</button>)}</nav>
      <div className="settings-panel"><div className="settings-panel-header"><div className="settings-icon-badge"><ShieldCheck size={19} /></div><div><h2>{active}</h2><p>Choose how Orbit handles your information and actions.</p></div></div>
        {active === 'Privacy & safety' ? <><div className="settings-group-label">APPROVALS &amp; DATA</div><div className="settings-options">{options.map((item, i) => <div className="setting-row" key={item.title}><div className="setting-copy"><b>{item.title}</b><span>{item.detail}</span></div><button className={`switch ${item.enabled ? 'on' : ''}`} onClick={() => change(i)} aria-label={`Toggle ${item.title}`}><span /></button></div>)}</div><div className="privacy-note"><LockKeyhole size={17} /><p><b>Your workspace, your rules</b><span>Orbit asks for approval before sensitive actions. You can change these controls at any time.</span></p></div></> : <div className="settings-placeholder"><span className="placeholder-icon">{active === 'Profile' ? <UserRound size={20} /> : active === 'Notifications' ? <Bell size={20} /> : <SlidersHorizontal size={20} />}</span><h3>{active} preferences</h3><p>These controls are ready to be connected to your workspace profile.</p><button className="text-button" onClick={() => showNotice(`${active} settings are a visual prototype.`)}>Configure <span>→</span></button></div>}
      </div></div>
    <div className="settings-footnote"><LockKeyhole size={13} /> Your changes stay in your workspace. <button onClick={() => showNotice('Privacy overview opened in this demo.')}>Learn about privacy</button></div>
  </section>;
}
