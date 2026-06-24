import { Link } from 'react-router-dom';
import './Legal.css';

function Accessibility() {
    return (
        <div className="legal-page">
            <header className="legal-hero" aria-label="Accessibility Statement header">
                <div className="legal-hero-inner">
                    <div className="legal-badge">Accessibility</div>
                    <h1>Accessibility Statement</h1>
                    <p className="legal-hero-sub">
                        Equalizer Learning Hub is committed to being usable by every student, regardless of ability or device.
                    </p>
                    <div className="legal-updated">
                        <span className="legal-updated-dot" aria-hidden="true" />
                        Last reviewed: June 2026
                    </div>
                </div>
            </header>

            <main className="legal-content" id="accessibility-content" aria-label="Accessibility Statement content">

                <section id="commitment" className="legal-section" aria-labelledby="acc-h-commitment">
                    <div className="legal-section-header">
                        <div className="legal-section-num" aria-hidden="true">01</div>
                        <div>
                            <span className="legal-section-tag">Our Goal</span>
                            <h2 id="acc-h-commitment">Our Commitment</h2>
                        </div>
                    </div>
                    <p>Equalizer Learning Hub aims to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. We believe every student deserves equal access to tutoring, resources, and their academic progress, regardless of disability or the device they use.</p>
                    <p>This Platform was built from the ground up with accessibility in mind, not added as an afterthought.</p>
                </section>

                <section id="features" className="legal-section" aria-labelledby="acc-h-features">
                    <div className="legal-section-header">
                        <div className="legal-section-num" aria-hidden="true">02</div>
                        <div>
                            <span className="legal-section-tag">What We've Built</span>
                            <h2 id="acc-h-features">Accessibility Features</h2>
                        </div>
                    </div>
                    <p>The following features are implemented across the Platform:</p>
                    <div className="legal-feature-grid">
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">Skip Navigation</div>
                            <p>A "Skip to main content" link appears at the top of every page, allowing keyboard users to bypass the navigation bar.</p>
                        </div>
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">Semantic HTML</div>
                            <p>Pages use proper heading hierarchy, landmark elements (main, nav, header, footer), and semantic sectioning.</p>
                        </div>
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">ARIA Labels</div>
                            <p>Interactive elements and regions include descriptive aria-label attributes for screen reader compatibility.</p>
                        </div>
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">Keyboard Navigation</div>
                            <p>All interactive elements (buttons, links, forms) are reachable and operable via keyboard alone.</p>
                        </div>
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">Color Contrast</div>
                            <p>Text and interactive elements maintain at least 4.5:1 contrast ratio against their backgrounds.</p>
                        </div>
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">No Emoji Dependence</div>
                            <p>Icons and indicators use text or SVG, not emoji, so they render clearly across all operating systems and screen readers.</p>
                        </div>
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">Responsive Layout</div>
                            <p>Every page adapts to mobile, tablet, and desktop screens without horizontal scrolling or content loss.</p>
                        </div>
                        <div className="legal-feature-card">
                            <div className="legal-feature-label">Focus Indicators</div>
                            <p>Keyboard focus is always visible with a clear, high-contrast outline on focused elements.</p>
                        </div>
                    </div>
                </section>

                <section id="devices" className="legal-section" aria-labelledby="acc-h-devices">
                    <div className="legal-section-header">
                        <div className="legal-section-num" aria-hidden="true">03</div>
                        <div>
                            <span className="legal-section-tag">Multi-Device</span>
                            <h2 id="acc-h-devices">Supported Devices and Browsers</h2>
                        </div>
                    </div>
                    <p>Equalizer Learning Hub is designed to work on:</p>
                    <ul>
                        <li><strong>Desktop and laptop:</strong> Chrome, Firefox, Safari, Edge (current versions)</li>
                        <li><strong>Tablets:</strong> iPad Safari, Android Chrome</li>
                        <li><strong>Mobile phones:</strong> iOS Safari, Android Chrome</li>
                        <li><strong>Screen readers:</strong> NVDA + Firefox, VoiceOver (macOS/iOS), TalkBack (Android)</li>
                    </ul>
                    <div className="legal-highlight">For the best experience on mobile, use Chrome or Safari in portrait or landscape orientation. All features including quizzes, session booking, and resource browsing are fully functional on small screens.</div>
                </section>

                <section id="limitations" className="legal-section" aria-labelledby="acc-h-limitations">
                    <div className="legal-section-header">
                        <div className="legal-section-num" aria-hidden="true">04</div>
                        <div>
                            <span className="legal-section-tag">Transparency</span>
                            <h2 id="acc-h-limitations">Known Limitations</h2>
                        </div>
                    </div>
                    <p>We strive for full accessibility but acknowledge the following current limitations:</p>
                    <ul>
                        <li>Video lessons hosted externally may not include closed captions on all content. We are working to add caption support for all video materials.</li>
                        <li>PDF service hour certificates may require a PDF reader with accessibility support for screen readers.</li>
                        <li>Some complex data visualizations (progress charts) have limited screen reader descriptions currently in development.</li>
                    </ul>
                    <p>We prioritize fixing reported accessibility barriers. If you encounter an issue not listed here, please tell us.</p>
                </section>

                <section id="feedback" className="legal-section" aria-labelledby="acc-h-feedback">
                    <div className="legal-section-header">
                        <div className="legal-section-num" aria-hidden="true">05</div>
                        <div>
                            <span className="legal-section-tag">Get Help</span>
                            <h2 id="acc-h-feedback">Report an Accessibility Issue</h2>
                        </div>
                    </div>
                    <p>If you experience a barrier that prevents you from accessing any part of this Platform, please contact us through our <Link to="/contact">Contact page</Link>. Include:</p>
                    <ul>
                        <li>A description of the barrier you encountered.</li>
                        <li>The page or feature where it occurred.</li>
                        <li>The browser and device you were using.</li>
                        <li>Any assistive technology you use (screen reader, switch access, etc.).</li>
                    </ul>
                    <p>We aim to respond to accessibility reports within 2 school days and to resolve barriers as quickly as possible.</p>
                </section>

                <div className="legal-cta" role="complementary" aria-label="Accessibility help and contact">
                    <h3>Need immediate assistance?</h3>
                    <p>If an accessibility issue is preventing you from booking a session or accessing your coursework, contact us and we'll help directly.</p>
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
