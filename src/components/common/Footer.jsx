import { Link } from 'react-router-dom';
import './Footer.css';
import equalizerfooter from '../../assets/EqualizerFooter.png';

const SOCIAL = [
    {
        name: 'Instagram',
        href: 'https://instagram.com',
        label: 'Follow us on Instagram',
        path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    },
    {
        name: 'X',
        href: 'https://x.com',
        label: 'Follow us on X (Twitter)',
        path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.623L18.244 2.25zM17.083 20.75h1.835L6.986 4.123H4.996l12.087 16.627z',
    },
    {
        name: 'YouTube',
        href: 'https://youtube.com',
        label: 'Watch us on YouTube',
        path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
    {
        name: 'LinkedIn',
        href: 'https://linkedin.com',
        label: 'Connect on LinkedIn',
        path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
];

function Footer() {
    return (
        <footer className="footer" role="contentinfo">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Column 1: About + Social */}
                    <div className="footer-column">
                        <div className="footer-logo">
                            <img src={equalizerfooter} alt="Equalizer Learning Hub" />
                            <p>Learning Hub</p>
                        </div>
                        <p className="footer-description">
                            Student-created platform for collaborative math learning and success.
                        </p>
                        <nav className="footer-social" aria-label="Social media links">
                            {SOCIAL.map(s => (
                                <a
                                    key={s.name}
                                    href={s.href}
                                    className="social-link"
                                    aria-label={s.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                        <path d={s.path} />
                                    </svg>
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="footer-column">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/schedule">Schedule</Link></li>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/resources">Resources</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div className="footer-column">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li><Link to="/resources">Video Library</Link></li>
                            <li><Link to="/resources">Practice Quizzes</Link></li>
                            <li><Link to="/resources">Study Guides</Link></li>
                            <li><Link to="/schedule">Our Tutors</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Support */}
                    <div className="footer-column">
                        <h4>Support</h4>
                        <ul className="footer-links">
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/apply/status">Application Status</Link></li>
                            <li><Link to="/apply">Become a Tutor</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            &copy; 2026 Equalizer Learning Hub. All rights reserved.
                        </p>
                        <div className="footer-bottom-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <span className="divider" aria-hidden="true">•</span>
                            <Link to="/terms">Terms of Service</Link>
                            <span className="divider" aria-hidden="true">•</span>
                            <Link to="/accessibility">Accessibility</Link>
                        </div>
                        <p className="footer-credits">
                            Built with React · Student-run, school-sponsored
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
