import { useState } from 'react';
import { Bell, Check, ChevronRight, LockKeyhole, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import usePersistentState from '../hooks/usePersistentState.js';

const initialSettings = {
  profile: { name: 'Jordan Diaz', email: 'jordan@example.com' },
  preferences: { language: 'English', timeZone: 'Europe/London', dateFormat: 'DD MMM YYYY' },
  privacy: [
    { title: 'Ask before sending messages', detail: 'Review messages before they leave Orbit.', enabled: true },
    { title: 'Confirm external actions', detail: 'Pause for confirmation before changes in connected tools.', enabled: true },
    { title: 'Use task history for context', detail: 'Allow this browser demo to show previous local task context.', enabled: false },
    { title: 'Data retention', detail: 'Keep demo task history available in this browser.', enabled: true },
  ],
  notifications: [
    { title: 'Task progress updates', detail: 'Preference for in-app task progress notices.', enabled: true },
    { title: 'Schedule reminders', detail: 'Preference for future scheduled-task reminders; none are sent in this demo.', enabled: true },
    { title: 'Weekly workspace summary', detail: 'Preference for a future weekly summary.', enabled: false },
  ],
};

const sections = [
  { id: 'Profile', icon: UserRound },
  { id: 'Preferences', icon: SlidersHorizontal },
  { id: 'Privacy & safety', icon: ShieldCheck },
  { id: 'Notifications', icon: Bell },
];

export default function SettingsPage({ showNotice }) {
  const [active, setActive] = useState('Privacy & safety');
  const [settings, setSettings] = usePersistentState('orbit:v1:settings', initialSettings);
  const ActiveIcon = sections.find((section) => section.id === active)?.icon || ShieldCheck;

  const updateGroup = (group, patch) => setSettings((current) => ({ ...current, [group]: { ...current[group], ...patch } }));
  const toggleItem = (group, index) => setSettings((current) => ({
    ...current,
    [group]: current[group].map((item, itemIndex) => itemIndex === index ? { ...item, enabled: !item.enabled } : item),
  }));
  const save = () => showNotice('Settings saved in this browser only. Nothing was sent to a server.');

  return <section className="page-content settings-page">
    <div className="page-title-row"><div><h1>Settings</h1><p className="page-subtitle">Make Orbit work the way you do</p></div><button className="save-button" onClick={save}><Check size={15} /> Save changes</button></div>
    <div className="settings-local-note">Settings are stored in this browser. Notification preferences do not send alerts in this prototype.</div>
    <div className="settings-layout">
      <nav className="settings-nav" aria-label="Settings sections">{sections.map(({ id, icon: Icon }) => <button key={id} className={active === id ? 'selected' : ''} aria-current={active === id ? 'page' : undefined} onClick={() => setActive(id)}><Icon size={16} /><span>{id}</span>{active === id && <ChevronRight size={14} />}</button>)}</nav>
      <div className="settings-panel">
        <div className="settings-panel-header"><div className="settings-icon-badge"><ActiveIcon size={19} /></div><div><h2>{active}</h2><p>{sectionDescription(active)}</p></div></div>
        {active === 'Profile' && <div className="settings-form">
          <label htmlFor="profile-name">Display name</label><input id="profile-name" autoComplete="name" maxLength={80} value={settings.profile.name} onChange={(event) => updateGroup('profile', { name: event.target.value })} />
          <label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" autoComplete="email" maxLength={120} value={settings.profile.email} onChange={(event) => updateGroup('profile', { email: event.target.value })} />
          <div className="settings-field-help">Profile values are illustrative local demo data and do not change an Orbit account.</div>
        </div>}
        {active === 'Preferences' && <div className="settings-form">
          <label htmlFor="pref-language">Language</label><select id="pref-language" value={settings.preferences.language} onChange={(event) => updateGroup('preferences', { language: event.target.value })}><option>English</option><option>French</option><option>Spanish</option><option>German</option></select>
          <label htmlFor="pref-timezone">Time zone</label><select id="pref-timezone" value={settings.preferences.timeZone} onChange={(event) => updateGroup('preferences', { timeZone: event.target.value })}><option value="Europe/London">Europe/London</option><option value="Europe/Paris">Europe/Paris</option><option value="America/New_York">America/New_York</option><option value="America/Los_Angeles">America/Los_Angeles</option><option value="Asia/Tokyo">Asia/Tokyo</option></select>
          <label htmlFor="pref-date">Date format</label><select id="pref-date" value={settings.preferences.dateFormat} onChange={(event) => updateGroup('preferences', { dateFormat: event.target.value })}><option>DD MMM YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
        </div>}
        {active === 'Privacy & safety' && <><div className="settings-group-label">APPROVALS &amp; DATA</div><div className="settings-options">{settings.privacy.map((item, index) => <SettingRow key={item.title} item={item} onToggle={() => toggleItem('privacy', index)} />)}</div><div className="privacy-note"><LockKeyhole size={17} /><p><b>Your workspace, your rules</b><span>These controls save as local preferences only; they do not change external services in this prototype.</span></p></div></>}
        {active === 'Notifications' && <><div className="settings-group-label">LOCAL NOTIFICATION PREFERENCES</div><div className="settings-options">{settings.notifications.map((item, index) => <SettingRow key={item.title} item={item} onToggle={() => toggleItem('notifications', index)} />)}</div><div className="privacy-note"><Bell size={17} /><p><b>No alerts are sent</b><span>These are saved preferences for a future connected version. This prototype does not send email, push, or scheduled notifications.</span></p></div></>}
      </div>
    </div>
    <div className="settings-footnote"><LockKeyhole size={13} /> Saved in this browser. <button onClick={() => showNotice('Your settings remain on this device until browser site data is cleared.')}>About local storage</button></div>
  </section>;
}

function sectionDescription(section) {
  if (section === 'Profile') return 'Edit the name and email shown in the local prototype.';
  if (section === 'Preferences') return 'Choose display preferences for a future connected version.';
  if (section === 'Notifications') return 'Set local preferences; no notifications are sent here.';
  return 'Choose how Orbit should handle approvals and local data.';
}

function SettingRow({ item, onToggle }) {
  return <div className="setting-row"><div className="setting-copy"><b>{item.title}</b><span>{item.detail}</span></div><button className={`switch ${item.enabled ? 'on' : ''}`} aria-pressed={item.enabled} aria-label={`${item.enabled ? 'Disable' : 'Enable'} ${item.title}`} onClick={onToggle}><span /></button></div>;
}
