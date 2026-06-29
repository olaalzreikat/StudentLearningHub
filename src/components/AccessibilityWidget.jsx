import { useState, useEffect, useRef } from 'react';
import './AccessibilityWidget.css';

const STORAGE_KEY = 'a11y-prefs';

const defaults = {
  screenReader:    false,
  bigCursor:       false,
  highlight:       false,
  fadeImages:      false,
  bigText:         false,
  highContrast:    false,
  dyslexiaFont:    false,
  pauseAnimations: false,
};

const CATEGORIES = [
  {
    label: 'Vision',
    items: [
      { key: 'highContrast',    icon: <ContrastIcon />,  label: 'High Contrast',      desc: 'Stronger colours' },
      { key: 'fadeImages',      icon: <ImageIcon />,     label: 'Reduce Images',      desc: 'Fades all images' },
    ],
  },
  {
    label: 'Reading',
    items: [
      { key: 'bigText',         icon: <TextSizeIcon />,  label: 'Bigger Text',        desc: 'Larger font size' },
      { key: 'dyslexiaFont',    icon: <DyslexiaIcon />,  label: 'Dyslexia Font',      desc: 'Clearer typeface' },
      { key: 'highlight',       icon: <HighlightIcon />, label: 'Highlight Text',     desc: 'Hover highlights' },
      { key: 'screenReader',    icon: <SpeakerIcon />,   label: 'Screen Reader',      desc: 'Reads text aloud' },
    ],
  },
  {
    label: 'Interaction',
    items: [
      { key: 'bigCursor',       icon: <CursorIcon />,    label: 'Large Cursor',       desc: 'Bigger pointer' },
      { key: 'pauseAnimations', icon: <PauseIcon />,     label: 'Stop Motion',        desc: 'Pauses animations' },
    ],
  },
];

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
    catch { return { ...defaults }; }
  });
  const widgetRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('a11y-big-cursor',       settings.bigCursor);
    document.body.classList.toggle('a11y-highlight',        settings.highlight);
    document.body.classList.toggle('a11y-fade-images',      settings.fadeImages);
    document.body.classList.toggle('a11y-reading',          settings.screenReader);
    document.body.classList.toggle('a11y-big-text',         settings.bigText);
    document.body.classList.toggle('a11y-high-contrast',    settings.highContrast);
    document.body.classList.toggle('a11y-dyslexia-font',    settings.dyslexiaFont);
    document.body.classList.toggle('a11y-pause-animations', settings.pauseAnimations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!settings.screenReader) { window.speechSynthesis?.cancel(); return; }
    const onPointerDown = (e) => {
      const el = e.target;
      const text = el.getAttribute('aria-label') || el.getAttribute('alt') || el.textContent?.trim();
      if (!text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.slice(0, 400));
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.speechSynthesis?.cancel();
    };
  }, [settings.screenReader]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));
  const reset  = () => { setSettings({ ...defaults }); window.speechSynthesis?.cancel(); };
  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className={`a11y-widget${open ? ' a11y-open' : ''}`} ref={widgetRef}>

      <button
        className="a11y-btn"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close accessibility panel' : 'Open accessibility options'}
        aria-expanded={open}
        title="Accessibility"
      >
        {activeCount > 0 && (
          <span className="a11y-badge" aria-label={`${activeCount} features active`}>{activeCount}</span>
        )}
        <PersonIcon />
        <span className="a11y-btn-label">A11y</span>
      </button>

      <div className="a11y-panel" role="dialog" aria-modal="false" aria-label="Accessibility settings">

        <div className="a11y-head">
          <PersonIcon />
          <div className="a11y-head-text">
            <h3>Accessibility</h3>
            <p>Customise your experience</p>
          </div>
          <button className="a11y-close" onClick={() => setOpen(false)} aria-label="Close">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="a11y-body">
          {CATEGORIES.map(cat => (
            <div className="a11y-category" key={cat.label}>
              <span className="a11y-cat-label">{cat.label}</span>
              <div className="a11y-cat-grid">
                {cat.items.map(item => (
                  <button
                    key={item.key}
                    className={`a11y-card${settings[item.key] ? ' on' : ''}`}
                    onClick={() => toggle(item.key)}
                    aria-pressed={settings[item.key]}
                  >
                    <span className="a11y-card-icon" aria-hidden="true">{item.icon}</span>
                    <strong className="a11y-card-label">{item.label}</strong>
                    <span className="a11y-card-desc">{item.desc}</span>
                    <div className={`a11y-switch${settings[item.key] ? ' on' : ''}`} aria-hidden="true">
                      <div className="a11y-thumb" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="a11y-foot">
          <button className="a11y-reset" onClick={reset} disabled={activeCount === 0}>
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M4 10a6 6 0 106-6H6M6 1v3l3 3-3 3V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset All
          </button>
          {activeCount > 0 && <span className="a11y-count-pill">{activeCount} active</span>}
        </div>

      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────── */

function PersonIcon() {
  return (
    <svg className="a11y-person" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="7" r="4.5" fill="currentColor"/>
      <path d="M16 13v9"       stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M5 17.5h22"    stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M16 22L9.5 31"  stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M16 22L22.5 31" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor"/>
      <path d="M15.5 8.5a5 5 0 010 7"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18.5 6a9 9 0 010 12"   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <path d="M5 3l14 9-7 1-3 7L5 3z" fill="currentColor"/>
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <path d="M4 6h16M4 11h12M4 16h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="13" y="13.5" width="7" height="4" rx="1" fill="currentColor" opacity="0.75"/>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="8.5" cy="10" r="1.5" fill="currentColor"/>
      <path d="M3 17l5-4 4 3 3-3 6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5l1 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45"/>
    </svg>
  );
}

function TextSizeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <path d="M3 7V5h9v2M7.5 5v14M15 12v-2h6v2M18 10v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ContrastIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3a9 9 0 010 18V3z" fill="currentColor"/>
    </svg>
  );
}

function DyslexiaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <path d="M4 17V7l4 5 4-5v10"   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 12h4a2 2 0 010 4h-4v-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 7h3.5a1.5 1.5 0 010 3H14V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="a11y-svg-icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 8v8M14 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
