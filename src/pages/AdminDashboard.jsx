import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

// Admin access: log in with admin@equalizer.edu / any password
const ADMIN_EMAIL = 'admin@equalizer.edu';
const APPS_KEY = 'tutorApplications';

function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applications');
    const [applications, setApplications] = useState([]);
    const [contactMessages, setContactMessages] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectNote, setRejectNote] = useState('');
    const [notif, setNotif] = useState('');

    const isAdmin = user?.email === ADMIN_EMAIL;

    useEffect(() => {
        if (!isAdmin) return;
        loadData();
    }, [isAdmin]);

    function loadData() {
        const apps = JSON.parse(localStorage.getItem(APPS_KEY) || '{}');
        setApplications(Object.values(apps).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)));
        const msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        setContactMessages(msgs.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    function showNotif(msg) {
        setNotif(msg);
        setTimeout(() => setNotif(''), 3000);
    }

    function approveApp(userId) {
        const apps = JSON.parse(localStorage.getItem(APPS_KEY) || '{}');
        if (apps[userId]) {
            apps[userId].status = 'approved';
            apps[userId].reviewedAt = new Date().toISOString();
            localStorage.setItem(APPS_KEY, JSON.stringify(apps));
            loadData();
            showNotif('Application approved. Applicant can now complete training.');
        }
    }

    function rejectApp(userId) {
        const apps = JSON.parse(localStorage.getItem(APPS_KEY) || '{}');
        if (apps[userId]) {
            apps[userId].status = 'rejected';
            apps[userId].reviewedAt = new Date().toISOString();
            apps[userId].reviewNote = rejectNote;
            localStorage.setItem(APPS_KEY, JSON.stringify(apps));
            setRejectModal(null);
            setRejectNote('');
            loadData();
            showNotif('Application rejected.');
        }
    }

    function deleteMessage(idx) {
        const msgs = [...contactMessages];
        msgs.splice(idx, 1);
        setContactMessages(msgs);
        localStorage.setItem('contactMessages', JSON.stringify(msgs));
    }

    if (!user) return (
        <div className="admin-page">
            <div className="admin-gate">
                <h2>Admin Access Required</h2>
                <p>Please log in with admin credentials.</p>
                <button onClick={() => navigate('/login')}>Log In</button>
            </div>
        </div>
    );

    if (!isAdmin) return (
        <div className="admin-page">
            <div className="admin-gate">
                <div className="admin-gate-icon">Restricted</div>
                <h2>Access Denied</h2>
                <p>This area is restricted to platform administrators.</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );

    const filteredApps = applications.filter(a =>
        filterStatus === 'all' || a.status === filterStatus
    );

    const pending = applications.filter(a => a.status === 'pending_review').length;
    const approved = applications.filter(a => a.status === 'approved' || a.status === 'active').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    const subjectColors = {
        Algebra: '#3b82f6', Geometry: '#8b5cf6', Calculus: '#ef4444',
        Statistics: '#10b981', Trigonometry: '#f59e0b', 'Pre-Calculus': '#06b6d4',
        'Algebra 1': '#3b82f6', 'Algebra 2': '#1d4ed8', 'Calculus AB': '#ef4444',
        Trigonometry: '#f59e0b',
    };

    return (
        <div className="admin-page">
            {notif && <div className="admin-notif">{notif}</div>}

            <div className="admin-header">
                <div>
                    <div className="admin-badge">Admin Panel</div>
                    <h1>Platform Dashboard</h1>
                    <p>Logged in as <strong>{user.email}</strong></p>
                </div>
            </div>

            {/* Stats */}
            <div className="admin-stats">
                <div className="admin-stat">
                    <span className="admin-stat-num">{applications.length}</span>
                    <span className="admin-stat-label">Total Applications</span>
                </div>
                <div className="admin-stat pending">
                    <span className="admin-stat-num">{pending}</span>
                    <span className="admin-stat-label">Pending Review</span>
                </div>
                <div className="admin-stat approved">
                    <span className="admin-stat-num">{approved}</span>
                    <span className="admin-stat-label">Approved / Active</span>
                </div>
                <div className="admin-stat rejected">
                    <span className="admin-stat-num">{rejected}</span>
                    <span className="admin-stat-label">Rejected</span>
                </div>
                <div className="admin-stat">
                    <span className="admin-stat-num">{contactMessages.length}</span>
                    <span className="admin-stat-label">Support Messages</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button className={`admin-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
                    Tutor Applications {pending > 0 && <span className="admin-badge-dot">{pending}</span>}
                </button>
                <button className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                    Support Messages {contactMessages.length > 0 && <span className="admin-badge-dot">{contactMessages.length}</span>}
                </button>
            </div>

            {/* Applications Tab */}
            {activeTab === 'applications' && (
                <div className="admin-section">
                    <div className="admin-filter-bar">
                        {['all', 'pending_review', 'approved', 'active', 'rejected', 'failed_quiz'].map(s => (
                            <button
                                key={s}
                                className={`admin-filter-btn ${filterStatus === s ? 'active' : ''}`}
                                onClick={() => setFilterStatus(s)}
                            >
                                {s === 'all' ? 'All' :
                                 s === 'pending_review' ? 'Pending' :
                                 s === 'approved' ? 'Approved (training)' :
                                 s === 'active' ? 'Active tutors' :
                                 s === 'rejected' ? 'Rejected' : 'Failed Quiz'}
                            </button>
                        ))}
                    </div>

                    {filteredApps.length === 0 ? (
                        <div className="admin-empty">No applications match this filter.</div>
                    ) : (
                        <div className="admin-app-list">
                            {filteredApps.map(app => (
                                <div key={app.userId} className={`admin-app-card status-${app.status}`}>
                                    <div className="admin-app-top">
                                        <div className="admin-app-avatar">
                                            {app.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="admin-app-info">
                                            <h3>{app.name}</h3>
                                            <span className="admin-app-email">{app.email}</span>
                                            <span className="admin-app-grade">Grade {app.grade}</span>
                                        </div>
                                        <div className="admin-app-meta">
                                            <span className={`admin-status-badge ${app.status}`}>
                                                {app.status === 'pending_review' ? 'Pending' :
                                                 app.status === 'approved' ? 'Approved' :
                                                 app.status === 'active' ? 'Active Tutor' :
                                                 app.status === 'rejected' ? 'Rejected' : 'Failed Quiz'}
                                            </span>
                                            <span className="admin-app-date">
                                                {new Date(app.appliedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="admin-app-body">
                                        <div className="admin-app-subjects">
                                            {(app.subjects || []).map(s => (
                                                <span key={s} className="admin-subj-tag" style={{ background: (subjectColors[s] || '#64748b') + '1a', color: subjectColors[s] || '#64748b' }}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="admin-app-score">
                                            <span>Quiz: </span>
                                            <strong className={app.quizPassed ? 'score-pass' : 'score-fail'}>
                                                {app.quizScore}/15 {app.quizPassed ? '✓ Pass' : '✗ Fail'}
                                            </strong>
                                        </div>

                                        <div className="admin-app-reason">
                                            <span className="admin-reason-label">Why they want to tutor:</span>
                                            <p>"{app.reason}"</p>
                                        </div>

                                        <div className="admin-app-ref">
                                            <span className="admin-reason-label">Teacher reference:</span>
                                            <span>{app.teacherRef?.name} ({app.teacherRef?.subject})</span>
                                        </div>

                                        {app.reviewNote && (
                                            <div className="admin-app-note">
                                                <span className="admin-reason-label">Review note:</span> {app.reviewNote}
                                            </div>
                                        )}
                                    </div>

                                    {app.status === 'pending_review' && (
                                        <div className="admin-app-actions">
                                            <button className="admin-approve-btn" onClick={() => approveApp(app.userId)}>
                                                ✓ Approve
                                            </button>
                                            <button className="admin-reject-btn" onClick={() => { setRejectModal(app.userId); setRejectNote(''); }}>
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}

                                    {app.status === 'approved' && (
                                        <div className="admin-app-actions">
                                            <span className="admin-status-note">Waiting for applicant to complete training checklist</span>
                                            <button className="admin-reject-btn" onClick={() => { setRejectModal(app.userId); setRejectNote(''); }}>
                                                Revoke Approval
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
                <div className="admin-section">
                    {contactMessages.length === 0 ? (
                        <div className="admin-empty">No support messages yet.</div>
                    ) : (
                        <div className="admin-msg-list">
                            {contactMessages.map((msg, i) => (
                                <div key={i} className="admin-msg-card">
                                    <div className="admin-msg-top">
                                        <div>
                                            <strong>{msg.name}</strong>
                                            <span className="admin-msg-email">{msg.email}</span>
                                        </div>
                                        <div className="admin-msg-meta">
                                            <span className="admin-msg-subject">{msg.subject}</span>
                                            <span className="admin-msg-date">{new Date(msg.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="admin-msg-body">"{msg.message}"</p>
                                    <button className="admin-msg-dismiss" onClick={() => deleteMessage(i)}>Mark as resolved</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="admin-modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Reject Application</h3>
                        <p>Optionally add a note explaining the decision. The applicant will see this on their status page.</p>
                        <textarea
                            rows={3}
                            placeholder="e.g. Quiz score was below threshold. Encouraged to review Calculus and reapply."
                            value={rejectNote}
                            onChange={e => setRejectNote(e.target.value)}
                        />
                        <div className="admin-modal-actions">
                            <button className="admin-reject-btn" onClick={() => rejectApp(rejectModal)}>Confirm Rejection</button>
                            <button className="admin-cancel-btn" onClick={() => setRejectModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
