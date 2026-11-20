import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Command as CommandIcon, CornerDownLeft, Search, X } from 'lucide-react';

export default function CommandPalette({ open, commands, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    setQuery('');
    setActiveIndex(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = priorOverflow;
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
    };
  }, [open]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) => `${command.title} ${command.description || ''} ${command.keywords || ''}`.toLowerCase().includes(normalized));
  }, [commands, query]);

  useEffect(() => setActiveIndex(0), [query]);

  if (!open) return null;

  const runCommand = (command) => {
    onClose();
    command.action();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'Tab') {
      const focusable = [...event.currentTarget.querySelectorAll('input:not([disabled]), button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && event.target === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && event.target === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === 'ArrowDown' && filtered.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % filtered.length);
    } else if (event.key === 'ArrowUp' && filtered.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + filtered.length) % filtered.length);
    } else if (event.key === 'Enter' && filtered[activeIndex]) {
      event.preventDefault();
      runCommand(filtered[activeIndex]);
    }
  };

  return <div className="command-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="command-palette" role="dialog" aria-modal="true" aria-label="Orbit command palette" onKeyDown={handleKeyDown}>
      <div className="command-search-row"><Search size={18} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages and actions…" aria-label="Search commands" aria-controls="orbit-command-list" /><kbd>ESC</kbd><button type="button" className="command-close" aria-label="Close command palette" onClick={onClose}><X size={16} /></button></div>
      <div className="command-list-heading">QUICK ACTIONS</div>
      <div className="command-list" id="orbit-command-list" role="listbox" aria-label="Commands">
        {filtered.length ? filtered.map((item, index) => {
          const Icon = item.icon || CommandIcon;
          return <button type="button" className={`command-option ${index === activeIndex ? 'active' : ''}`} role="option" aria-selected={index === activeIndex} key={item.id} onMouseEnter={() => setActiveIndex(index)} onClick={() => runCommand(item)}>
            <span className="command-option-icon"><Icon size={16} /></span><span className="command-option-copy"><b>{item.title}</b><small>{item.description}</small></span>{index === activeIndex && <CornerDownLeft size={14} className="command-enter-icon" />}
          </button>;
        }) : <div className="command-empty">No matching pages or actions.</div>}
      </div>
      <footer className="command-footer"><span><kbd><ArrowUp size={10} /></kbd><kbd><ArrowDown size={10} /></kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span className="command-shortcut-hint"><CommandIcon size={12} />K anytime</span></footer>
    </section>
  </div>;
}
