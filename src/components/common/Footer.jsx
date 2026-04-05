import { Link } from 'react-router-dom';
import './Footer.css';
import equalizerfooter from '../../assets/EqualizerFooter.png';


function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Column 1: About */}
                    <div className="footer-column">
                        <div className="footer-logo">
                          <img src={equalizerfooter} alt="Equalizer Learning Hub" />
                            <p>Learning Hub</p>
                        </div>
                        <p className="footer-description">
                            Student created platform for collaborative math learning and success.
                        </p>
                       
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
                            <li><a href="#tutors">Our Tutors</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Support */}
                    <div className="footer-column">
                        <h4>Support</h4>
                        <ul className="footer-links">
                            <li><a href="#help">Help Center</a></li>
                            <li><a href="#contact">Contact Us</a></li>
                            <li><a href="#faq">FAQ</a></li>
                            <li><a href="#feedback">Feedback</a></li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            © 2026 Equalizer Learning Hub.
                        </p>
                        <div className="footer-bottom-links">
                            <a href="#privacy">Privacy Policy</a>
                            <span className="divider">•</span>
                            <a href="#terms">Terms of Service</a>
                            <span className="divider">•</span>
                            <a href="#accessibility">Accessibility</a>
                        </div>
                        <p className="footer-credits">
                            Built with React
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
