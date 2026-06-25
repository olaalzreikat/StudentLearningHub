import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import equalizerLogo from '../../assets/equalizer.png';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [tutorProfile, setTutorProfile] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, logout, switchRole } = useAuth();
    const dropdownRef = useRef(null);

    // Load tutor profile when dropdown opens or role changes
    useEffect(() => {
        if (user && role === 'tutor') {
            const saved = localStorage.getItem('tutorProfiles');
            if (saved) {
                const profiles = JSON.parse(saved);
                setTutorProfile(profiles[user.uid] || null);
            }
        } else {
            setTutorProfile(null);
        }
    }, [user, role, isAccountOpen]);

    async function handleLogout() {
        setIsAccountOpen(false);
        await logout();
        navigate('/');
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsAccountOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav id="navbar" className="navbar" aria-label="Main navigation">
            <div className="nav-container">
                <div className="logo">
                    <div className="logo-text">
                        <Link to="/"><img src={equalizerLogo} alt="Equalizer Learning Hub" /></Link>
                    </div>
                </div>

                <ul id="nav-links-list" className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/" className={isActive('/')} onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
                    <li><Link to="/schedule" className={isActive('/schedule')} onClick={() => setIsMobileMenuOpen(false)}>Schedule</Link></li>
                    <li><Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
                    {role === 'tutor'
                        ? <li><Link to="/students" className={isActive('/students')} onClick={() => setIsMobileMenuOpen(false)}>Students</Link></li>
                        : <li><Link to="/resources" className={isActive('/resources')} onClick={() => setIsMobileMenuOpen(false)}>Resources</Link></li>
                    }
                    {role !== 'tutor' && (
                        <li><Link to="/flashcards" className={isActive('/flashcards')} onClick={() => setIsMobileMenuOpen(false)}>Flashcards</Link></li>
                    )}
                    {user?.email === 'admin@equalizer.edu' && (
                        <li><Link to="/admin" className={isActive('/admin')} onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#f59e0b', fontWeight: 800 }}>Admin</Link></li>
                    )}
                </ul>

                <div className="nav-auth">
                    <Link to="/contact" className={`nav-contact-btn${location.pathname === '/contact' ? ' active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                    {user ? (
                        <div className="account-menu" ref={dropdownRef}>
                            <button
                                className="account-btn"
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                aria-expanded={isAccountOpen}
                                aria-label="Account menu"
                            >
                                <span className="account-avatar">
                                    {user.email.charAt(0).toUpperCase()}
                                </span>
                                <span className="account-role-label">
                                    {role === 'tutor' ? 'Tutor' : 'Student'}
                                </span>
                                <span className="account-chevron">{isAccountOpen ? '▲' : '▼'}</span>
                            </button>

                            {isAccountOpen && (
                                <div className="account-dropdown">
                                    {/* Profile section */}
                                    <div className="dropdown-profile">
                                        <div className="dropdown-avatar">
                                            {(tutorProfile?.name || user.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="dropdown-profile-info">
                                            {tutorProfile?.name
                                                ? <span className="dropdown-name">{tutorProfile.name}</span>
                                                : <span className="dropdown-name">{user.email.split('@')[0]}</span>
                                            }
                                            <span className="dropdown-email-small">{user.email}</span>
                                        </div>
                                    </div>

                                    {/* Tutor profile details */}
                                    {role === 'tutor' && tutorProfile && (
                                        <>
                                            {tutorProfile.subjects?.length > 0 && (
                                                <div className="dropdown-subjects">
                                                    {tutorProfile.subjects.map(s => (
                                                        <span key={s} className="dropdown-subject-tag">
                                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {tutorProfile.availability && (
                                                <p className="dropdown-avail">{tutorProfile.availability}</p>
                                            )}
                                        </>
                                    )}

                                    {role === 'tutor' && (
                                        <button
                                            className="dropdown-setup-profile-btn"
                                            onClick={() => { setIsAccountOpen(false); navigate('/profile'); }}
                                        >
                                            {tutorProfile?.name ? 'Edit Profile →' : 'Set up your profile →'}
                                        </button>
                                    )}

                                    <div className="dropdown-divider" />
                                    <button className="dropdown-logout-btn" onClick={handleLogout}>
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="nav-login-btn" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                    )}
                </div>

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
