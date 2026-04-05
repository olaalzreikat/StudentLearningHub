import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import equalizerLogo from '../../assets/equalizer.png';
import './Navbar.css';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav id="navbar" className="navbar" aria-label="Main navigation">
            <div className="nav-container">
                <div className="logo">
                    <div className="logo-text">
                        <Link to="/"><img src={equalizerLogo} alt="Equalizer Learning Hub" /></Link>
                    </div>
                </div>
                
                <ul id="nav-links-list" className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <li>
                        <Link to="/" className={isActive('/')} onClick={() => setIsMobileMenuOpen(false)}>
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/schedule" className={isActive('/schedule')} onClick={() => setIsMobileMenuOpen(false)}>
                            Schedule
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/resources" className={isActive('/resources')} onClick={() => setIsMobileMenuOpen(false)}>
                            Resources
                        </Link>
                    </li>
                </ul>
                
                <button
                    className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="nav-links-list"
                >
                    <span className="burger-line"></span>
                    <span className="burger-line"></span>
                    <span className="burger-line"></span>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
