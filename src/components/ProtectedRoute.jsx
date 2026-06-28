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
            <style>{`
                .pr-btn { padding: 10px 28px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease; display: inline-block; }
                .pr-btn-primary { background: rgb(8,8,85); color: white; }
                .pr-btn-primary:hover { background: #1e40af; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(8,8,85,0.35); }
                .pr-btn-outline { background: transparent; color: rgb(8,8,85); border: 1.5px solid rgb(8,8,85); }
                .pr-btn-outline:hover { background: rgb(8,8,85); color: white; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(8,8,85,0.25); }
            `}</style>
            <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/login" className="pr-btn pr-btn-primary">Sign in</Link>
                <Link to="/login" state={{ mode: 'signup' }} className="pr-btn pr-btn-outline">Sign up</Link>
            </div>
        </div>
    );

    return children;
}

export default ProtectedRoute;
