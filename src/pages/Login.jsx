import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import equalizerLogo from '../assets/equalizer.png';
import './Login.css';

function Login() {
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.mode === 'signup' ? 'signup' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const { login, signup, resetPassword } = useAuth();
    const navigate = useNavigate();

    async function handleForgotPassword() {
        if (!email) { setError('Enter your email above first, then click Forgot password.'); return; }
        try {
            await resetPassword(email);
            setResetSent(true);
            setError('');
        } catch (err) {
            setError(friendlyError(err.code));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (mode === 'signup' && !termsAccepted) {
            setError('You must agree to the Terms of Service to create an account.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signup(email, password, 'student');
            }
            navigate('/dashboard');
        } catch (err) {
            setError(friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <Link to="/">
                    <img src={equalizerLogo} alt="Equalizer Learning Hub" className="login-logo" />
                </Link>
                <h1 className="login-title">
                    {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="login-subtitle">
                    {mode === 'login' ? 'Sign in to access your dashboard' : 'Join the Equalizer Learning Hub'}
                </p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            minLength={6}
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="login-signup-note">
                            All accounts start as Student. You can apply to become a tutor from your dashboard after signing in.
                        </div>
                    )}

                    {mode === 'signup' && (
                        <label className="tos-check">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={e => setTermsAccepted(e.target.checked)}
                            />
                            <span>
                                I agree to the{' '}
                                <button type="button" className="tos-link" onClick={() => setShowTerms(true)}>
                                    Terms of Service
                                </button>
                            </span>
                        </label>
                    )}

                    {mode === 'login' && (
                        <div className="login-forgot-row">
                            <button type="button" className="tos-link" onClick={handleForgotPassword}>
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {resetSent && (
                        <p className="login-reset-sent">Password reset email sent — check your inbox.</p>
                    )}

                    {mode === 'login' && (
                        <p className="tos-notice">
                            By signing in you agree to our{' '}
                            <button type="button" className="tos-link" onClick={() => setShowTerms(true)}>
                                Terms of Service
                            </button>
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading || (mode === 'signup' && !termsAccepted)}
                    >
                        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                </form>

                <p className="login-toggle">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        className="login-toggle-btn"
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setTermsAccepted(false); }}
                    >
                        {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>

            {showTerms && (
                <div className="tos-overlay" onClick={() => setShowTerms(false)}>
                    <div className="tos-modal" onClick={e => e.stopPropagation()}>
                        <div className="tos-modal-header">
                            <h2>Terms of Service</h2>
                            <button className="tos-modal-close" onClick={() => setShowTerms(false)} aria-label="Close">&#10005;</button>
                        </div>
                        <div className="tos-modal-body">
                            <p className="tos-updated">Last updated: June 2025</p>

                            <h3>1. Acceptance of Terms</h3>
                            <p>By creating an account or using Equalizer Learning Hub, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>

                            <h3>2. Eligibility</h3>
                            <p>You must be a student or educator at an eligible institution. By registering, you confirm you meet this requirement.</p>

                            <h3>3. Account Responsibilities</h3>
                            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>

                            <h3>4. Platform Use</h3>
                            <p>Equalizer Learning Hub is provided for peer tutoring and academic support. You agree not to misuse the platform, post harmful content, or harass other users.</p>

                            <h3>5. Tutoring Sessions</h3>
                            <p>Session requests are matched based on availability. Tutors and students are expected to communicate respectfully and honor scheduled commitments.</p>

                            <h3>6. Privacy</h3>
                            <p>Your data is handled in accordance with our Privacy Policy. We do not sell your personal information to third parties.</p>

                            <h3>7. Intellectual Property</h3>
                            <p>All content on this platform, including course materials and resources, remains the property of Equalizer Learning Hub unless otherwise stated.</p>

                            <h3>8. Termination</h3>
                            <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in conduct harmful to the community.</p>

                            <h3>9. Changes to Terms</h3>
                            <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>

                            <h3>10. Contact</h3>
                            <p>Questions about these Terms? Contact us through the Contact page on our website.</p>
                        </div>
                        {mode === 'signup' && (
                            <div className="tos-modal-footer">
                                <button
                                    className="tos-accept-btn"
                                    onClick={() => { setTermsAccepted(true); setShowTerms(false); }}
                                >
                                    I Agree
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function friendlyError(code) {
    switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return 'Something went wrong. Please try again.';
    }
}

export default Login;
