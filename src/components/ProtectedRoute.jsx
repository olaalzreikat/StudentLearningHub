import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#1e3a8a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!user) return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px 20px',
            textAlign: 'center',
        }}>
            <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                fontSize: 28,
            }}>
                🔒
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                Login Required
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: 28, maxWidth: 360 }}>
                You need to sign in to view this page.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
                <Link
                    to="/login"
                    style={{
                        padding: '10px 24px',
                        borderRadius: 25,
                        background: 'rgb(8,8,85)',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                    }}
                >
                    Sign in
                </Link>
                <Link
                    to="/login"
                    state={{ mode: 'signup' }}
                    style={{
                        padding: '10px 24px',
                        borderRadius: 25,
                        background: 'transparent',
                        color: 'rgb(8,8,85)',
                        border: '1.5px solid rgb(8,8,85)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                    }}
                >
                    Sign up
                </Link>
            </div>
        </div>
    );

    return children;
}

export default ProtectedRoute;
