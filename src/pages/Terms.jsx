import { Link } from 'react-router-dom';
import './Legal.css';

function Terms() {
    return (
        <div className="legal-page">
            <header className="legal-hero">
                <div className="legal-hero-inner">
                    <div className="legal-badge">Legal</div>
                    <h1>Terms of Service</h1>
                    <p className="legal-hero-sub">Simple rules for a respectful community.</p>
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
                        <h2>Acceptance</h2>
                        <p>By creating an account or using Equalizer Learning Hub you agree to these terms. If you don't agree, please don't use the platform.</p>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">02</div>
                        <h2>Eligibility</h2>
                        <ul>
                            <li>Enrolled students and approved tutors only</li>
                            <li>Educational use only</li>
                            <li>Accurate account information required</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">03</div>
                        <h2>Your Account</h2>
                        <ul>
                            <li>Keep your password private</li>
                            <li>One account per person — no sharing</li>
                            <li>Report suspicious activity immediately</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">04</div>
                        <h2>Tutoring Sessions</h2>
                        <ul>
                            <li>Attend on time or cancel 24 hrs ahead</li>
                            <li>Treat every student and tutor with respect</li>
                            <li>No payments outside the platform</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">05</div>
                        <h2>Community Rules</h2>
                        <ul>
                            <li>No harassment, bullying, or discrimination</li>
                            <li>No sharing personal contact info off-platform</li>
                            <li>No misrepresentation of identity or qualifications</li>
                        </ul>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">06</div>
                        <h2>Content</h2>
                        <p>All platform content (quizzes, guides, materials) is for your personal study only. Don't reproduce or distribute it without permission.</p>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">07</div>
                        <h2>Service Hours</h2>
                        <p>Hours are awarded for confirmed sessions only. Verify your records before submitting certificates to your school or NHS chapter.</p>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">08</div>
                        <h2>Privacy</h2>
                        <p>Your data is handled per our <Link to="/privacy">Privacy Policy</Link>. We don't sell or share your information for commercial purposes.</p>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">09</div>
                        <h2>Changes</h2>
                        <p>We may update these terms occasionally. The date above will reflect any changes. Continued use means you accept the latest version.</p>
                    </div>

                    <div className="legal-card">
                        <div className="legal-card-num">10</div>
                        <h2>Contact</h2>
                        <p>Questions? Reach us on the <Link to="/contact">Contact page</Link>. We respond within 2-3 school days.</p>
                    </div>

                </div>

                <div className="legal-cta">
                    <h3>Questions about these terms?</h3>
                    <p>Our team is happy to clarify anything.</p>
                    <div className="legal-cta-links">
                        <Link to="/contact" className="legal-cta-btn primary">Contact Us</Link>
                        <Link to="/privacy" className="legal-cta-btn ghost">Privacy Policy</Link>
                        <Link to="/accessibility" className="legal-cta-btn ghost">Accessibility</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Terms;
