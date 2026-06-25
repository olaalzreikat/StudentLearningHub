import { Link } from 'react-router-dom';
import './Legal.css';

function Privacy() {
    return (
        <div className="legal-page">
            <header className="legal-hero">
                <div className="legal-hero-inner">
                    <div className="legal-badge">Legal</div>
                    <h1>Privacy Policy</h1>
                    <p className="legal-hero-sub">What we collect, why, and how we protect it.</p>
                    <div className="legal-updated">
                        <span className="legal-updated-dot" />
                        Last updated: June 2026
                    </div>
                </div>
            </header>

            <main className="legal-content">
                <div className="legal-sections-grid">

                    <div className="legal-card">
                        <div className="legal-card-num">01</div>
                        <h2>What We Collect</h2>
                        <ul>
                            <li>First name, last initial, email, grade level</li>
                            <li>Tutor application data and quiz results</li>
                            <li>Session records (date, subject, status)</li>
                            <li>Course progress stored in your browser</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">02</div>
                        <h2>How We Use It</h2>
                        <ul>
                            <li>Matching students with tutors</li>
                            <li>Tracking and verifying service hours</li>
                            <li>Reviewing tutor applications</li>
                            <li>Never for advertising or profiling</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">03</div>
                        <h2>Data Sharing</h2>
                        <ul>
                            <li>We don't sell your data — ever</li>
                            <li>Admins access only for dispute resolution</li>
                            <li>Your school only sees certificate totals, not messages</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">04</div>
                        <h2>Student Rights (FERPA)</h2>
                        <ul>
                            <li>Student records not shared without consent</li>
                            <li>Parents of minors can request data access or deletion</li>
                            <li>Students 18+ hold their own FERPA rights</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">05</div>
                        <h2>Security</h2>
                        <ul>
                            <li>Encrypted login via Firebase (Google Cloud)</li>
                            <li>Role-based access — you only see your data</li>
                            <li>No plaintext passwords stored anywhere</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">06</div>
                        <h2>Local Storage</h2>
                        <ul>
                            <li>Progress and quiz data stays on your device</li>
                            <li>Cleared when you clear site data</li>
                            <li>No tracking cookies or third-party analytics</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">07</div>
                        <h2>Your Rights</h2>
                        <ul>
                            <li>Access — request a copy of your data</li>
                            <li>Correction — update inaccurate info</li>
                            <li>Deletion — request account removal</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">08</div>
                        <h2>Changes</h2>
                        <p>We may update this policy occasionally. The date above reflects the latest version. Continued use means you accept any updates.</p>
                    </div>

                    <div className="legal-card legal-card--wide">
                        <div className="legal-card-num">09</div>
                        <h2>Contact</h2>
                        <p>For privacy questions or data requests, use our <Link to="/contact">Contact page</Link>. We respond within 5 school days.</p>
                    </div>

                </div>

                <div className="legal-cta">
                    <h3>Questions about your data?</h3>
                    <p>We're transparent about everything. Reach out any time.</p>
                    <div className="legal-cta-links">
                        <Link to="/contact" className="legal-cta-btn primary">Contact Us</Link>
                        <Link to="/terms" className="legal-cta-btn ghost">Terms of Service</Link>
                        <Link to="/accessibility" className="legal-cta-btn ghost">Accessibility</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Privacy;
