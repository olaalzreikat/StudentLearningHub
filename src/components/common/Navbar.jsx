import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import equalizerLogo from '../../assets/equalizer.png';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [tutorProfile, setTutorProfile] = useState(null);
    const [msgUnread, setMsgUnread] = useState(() => parseInt(localStorage.getItem('msg-unread-count') || '0', 10));
    const [lang, setLang] = useState(() => localStorage.getItem('preferred-lang') || 'en');
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef(null);
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

    // Sync unread count from localStorage when Messages page updates it
    useEffect(() => {
        const sync = () => setMsgUnread(parseInt(localStorage.getItem('msg-unread-count') || '0', 10));
        window.addEventListener('msg-unread-update', sync);
        return () => window.removeEventListener('msg-unread-update', sync);
    }, []);

    // Close lang dropdown when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const switchLanguage = (newLang) => {
        localStorage.setItem('preferred-lang', newLang);
        setLang(newLang);
        setLangOpen(false);
        if (newLang === 'es') {
            document.cookie = 'googtrans=/en/es; path=/';
            document.cookie = `googtrans=/en/es; path=/; domain=.${window.location.hostname}`;
        } else {
            document.cookie = 'googtrans=; path=/; max-age=0';
            document.cookie = `googtrans=; path=/; domain=.${window.location.hostname}; max-age=0`;
        }
        window.location.reload();
    };

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
                        : (
                            <li className="nav-dropdown-parent">
                                <Link
                                    to="/resources"
                                    className={`nav-dropdown-trigger${['/resources', '/flashcards'].includes(location.pathname) ? ' active' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Resources <span className="nav-dropdown-caret">▾</span>
                                </Link>
                                <ul className="nav-dropdown-menu">
                                    <li>
                                        <Link to="/resources" className={isActive('/resources')} onClick={() => setIsMobileMenuOpen(false)}>
                                            Browse Resources
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/flashcards" className={isActive('/flashcards')} onClick={() => setIsMobileMenuOpen(false)}>
                                            Flashcards
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        )
                    }
                    <li>
                        <Link to="/messages" className={isActive('/messages')} onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'relative' }}>
                            Messages
                            {msgUnread > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-4px', right: '-10px',
                                    background: '#ef4444', color: 'white',
                                    fontSize: '0.6rem', fontWeight: 800,
                                    borderRadius: '20px', padding: '1px 5px',
                                    lineHeight: 1.4, minWidth: '16px', textAlign: 'center'
                                }}>{msgUnread}</span>
                            )}
                        </Link>
                    </li>
                    <li><Link to="/contact" className={isActive('/contact')} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
                    {user?.email === 'admin@equalizer.edu' && (
                        <li><Link to="/admin" className={isActive('/admin')} onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#f59e0b', fontWeight: 800 }}>Admin</Link></li>
                    )}
                </ul>

                <div className="nav-auth">
                    {/* Language switcher — translate="no" prevents GT from translating "English" to "Inglés" */}
                    <div className="nav-lang-switcher notranslate" ref={langRef} translate="no">
                        <button className="nav-lang-btn notranslate" onClick={() => setLangOpen(!langOpen)} translate="no">
                            {lang === 'es' ? 'Español' : 'English'} <span className="nav-lang-caret">▾</span>
                        </button>
                        {langOpen && (
                            <div className="nav-lang-dropdown notranslate" translate="no">
                                <button className={`nav-lang-option ${lang === 'en' ? 'active' : ''}`} onClick={() => switchLanguage('en')}>
                                    English
                                </button>
                                <button className={`nav-lang-option ${lang === 'es' ? 'active' : ''}`} onClick={() => switchLanguage('es')}>
                                    Español
                                </button>
                            </div>
                        )}
                    </div>
                    {user ? (
                        <div className="account-menu" ref={dropdownRef}>
                            <button
                                className="account-btn"
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                aria-expanded={isAccountOpen}
                                aria-label="Account menu"
                            >
                                <span className="account-avatar">
                                    {tutorProfile?.photo
                                        ? <img src={tutorProfile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        : user.email.charAt(0).toUpperCase()
                                    }
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
                                            {tutorProfile?.photo
                                                ? <img src={tutorProfile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                : (tutorProfile?.name || user.email).charAt(0).toUpperCase()
                                            }
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

                                    {user?.email === 'oalzreikat@gmail.com' && (<>
                                        <div className="dropdown-divider" />
                                        <button
                                            className="dropdown-role-switch-btn"
                                            onClick={async () => {
                                                setIsAccountOpen(false);
                                                await switchRole(role === 'tutor' ? 'student' : 'tutor');
                                                navigate('/dashboard');
                                            }}
                                        >
                                            {role === 'tutor' ? 'Switch to Student view' : 'Switch to Tutor view'}
                                        </button>
                                    </>)}
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-logout-btn" onClick={handleLogout}>
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-login-btn nav-login-outline" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                            <Link to="/login" state={{ mode: 'signup' }} className="nav-login-btn" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
                        </>
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
