import { Link } from 'react-router-dom';
import './Legal.css';

const features = [
    { label: 'Skip Navigation', desc: 'Skip to main content link on every page for keyboard users.' },
    { label: 'Semantic HTML', desc: 'Proper headings, landmarks, and sectioning throughout.' },
    { label: 'ARIA Labels', desc: 'All interactive regions labeled for screen readers.' },
    { label: 'Keyboard Navigation', desc: 'Every button, link, and form reachable by keyboard alone.' },
    { label: 'Color Contrast', desc: 'At least 4.5:1 contrast ratio on all text and controls.' },
    { label: 'No Emoji Dependence', desc: 'Icons use text or SVG, not emoji, for reliable rendering.' },
    { label: 'Responsive Layout', desc: 'Works on all screen sizes — no horizontal scrolling.' },
    { label: 'Focus Indicators', desc: 'Visible, high-contrast focus outline on all focused elements.' },
];

function Accessibility() {
    return (
        <div className="legal-page">
            <header className="legal-hero">
                <div className="legal-hero-inner">
                    <div className="legal-badge">Accessibility</div>
                    <h1>Accessibility Statement</h1>
                    <p className="legal-hero-sub">Built for every student, on every device.</p>
                    <div className="legal-updated">
                        <span className="legal-updated-dot" />
                        Last reviewed: June 2026
                    </div>
                </div>
            </header>

            <main className="legal-content">

                <div className="legal-sections-grid legal-sections-grid--3col">
                    <div className="legal-card legal-card--accent">
                        <div className="legal-card-num">01</div>
                        <h2>Our Commitment</h2>
                        <p>We target WCAG 2.1 Level AA. Accessibility was built in from the start, not added later.</p>
                    </div>

                    <div className="legal-card legal-card--accent">
                        <div className="legal-card-num">02</div>
                        <h2>Supported Browsers</h2>
                        <ul>
                            <li>Chrome, Firefox, Safari, Edge</li>
                            <li>iOS Safari, Android Chrome</li>
                            <li>NVDA, VoiceOver, TalkBack</li>
                        </ul>
                    </div>

                    <div className="legal-card legal-card--accent">
                        <div className="legal-card-num">03</div>
                        <h2>Known Limitations</h2>
                        <ul>
                            <li>Some external videos lack captions</li>
                            <li>PDF certificates need an accessible reader</li>
                            <li>Progress charts have limited screen reader descriptions</li>
                        </ul>
                    </div>
                </div>

                <div className="legal-feature-section">
                    <h2 className="legal-feature-heading">Accessibility Features</h2>
                    <div className="legal-feature-grid">
                        {features.map(f => (
                            <div key={f.label} className="legal-feature-card">
                                <div className="legal-feature-label">{f.label}</div>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="legal-cta">
                    <h3>Found an accessibility issue?</h3>
                    <p>Tell us the page, browser, and device — we aim to respond within 2 school days.</p>
                    <div className="legal-cta-links">
                        <Link to="/contact" className="legal-cta-btn primary">Contact Support</Link>
                        <Link to="/terms" className="legal-cta-btn ghost">Terms of Service</Link>
                        <Link to="/privacy" className="legal-cta-btn ghost">Privacy Policy</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Accessibility;
