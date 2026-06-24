import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Students.css';

function Students() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!user) return;

        const sessionsRaw = localStorage.getItem('tutorPostedSessions');
        const rostersRaw = localStorage.getItem('sessionRosters');
        const requestsRaw = localStorage.getItem('oneOnOneRequests');

        const mySessions = sessionsRaw
            ? JSON.parse(sessionsRaw).filter(s => s.tutorId === user.uid)
            : [];

        const rosters = rostersRaw ? JSON.parse(rostersRaw) : {};
        const requests = requestsRaw
            ? JSON.parse(requestsRaw).filter(r => r.tutorId === user.uid)
            : [];

        // Build a map keyed by student email
        const map = {};

        mySessions.forEach(session => {
            const roster = rosters[session.id] || [];
            roster.forEach(entry => {
                const email = entry.email;
                if (!map[email]) map[email] = { email, joinedSessions: [], requests: [] };
                map[email].joinedSessions.push({
                    title: session.title,
                    subject: session.subject,
                    date: session.date,
                    time: session.time,
                    sessionId: session.id,
                });
            });
        });

        requests.forEach(req => {
            const email = req.studentEmail;
            if (!map[email]) map[email] = { email, joinedSessions: [], requests: [] };
            map[email].requests.push(req);
        });

        setStudents(Object.values(map));
    }, [user]);

    const filtered = students.filter(s => {
        if (search && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
        if (activeTab === 'sessions') return s.joinedSessions.length > 0;
        if (activeTab === 'requests') return s.requests.length > 0;
        return true;
    });

    const pendingCount = students.reduce((n, s) => n + s.requests.filter(r => r.status === 'pending').length, 0);

    const statusColor = (status) => {
        if (status === 'accepted') return '#16a34a';
        if (status === 'pending') return '#d97706';
        if (status === 'declined') return '#94a3b8';
        if (status === 'cancelled' || status === 'cancelled_by_student') return '#dc2626';
        return '#94a3b8';
    };

    const statusLabel = (status) => {
        if (status === 'cancelled_by_student') return 'Cancelled by student';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="students-page">
            <div className="students-header">
                <div className="students-header-inner">
                    <div>
                        <h1>Your Students</h1>
                        <p className="students-subtitle">Everyone who has joined your sessions or sent you a request</p>
                    </div>
                    <div className="students-header-stats">
                        <div className="stu-stat">
                            <span className="stu-stat-num">{students.length}</span>
                            <span className="stu-stat-label">Total Students</span>
                        </div>
                        <div className="stu-stat">
                            <span className="stu-stat-num">{pendingCount}</span>
                            <span className="stu-stat-label">Pending Requests</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="students-body">
                <div className="students-toolbar">
                    <div className="students-tabs">
                        <button className={`stu-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All ({students.length})</button>
                        <button className={`stu-tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
                            Joined Sessions
                        </button>
                        <button className={`stu-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                            Requests {pendingCount > 0 && <span className="stu-tab-badge">{pendingCount}</span>}
                        </button>
                    </div>
                    <input
                        className="students-search"
                        type="text"
                        placeholder="Search by email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="students-empty">
                        <div className="students-empty-icon"></div>
                        <h3>{students.length === 0 ? 'No students yet' : 'No results'}</h3>
                        <p>{students.length === 0
                            ? 'Once students join your sessions or send you requests, they\'ll appear here.'
                            : 'Try a different search or filter.'
                        }</p>
                        {students.length === 0 && (
                            <button className="stu-post-btn" onClick={() => navigate('/dashboard')}>Post a Session</button>
                        )}
                    </div>
                ) : (
                    <div className="students-grid">
                        {filtered.map(student => (
                            <div key={student.email} className="student-card">
                                <div className="student-card-top">
                                    <div className="student-avatar">
                                        {student.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="student-info">
                                        <span className="student-email">{student.email}</span>
                                        <div className="student-tags">
                                            {student.joinedSessions.length > 0 && (
                                                <span className="student-tag tag-session">{student.joinedSessions.length} session{student.joinedSessions.length !== 1 ? 's' : ''}</span>
                                            )}
                                            {student.requests.length > 0 && (
                                                <span className="student-tag tag-request">{student.requests.length} request{student.requests.length !== 1 ? 's' : ''}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {student.joinedSessions.length > 0 && (
                                    <div className="student-section">
                                        <p className="student-section-label">Joined Sessions</p>
                                        <div className="student-session-list">
                                            {student.joinedSessions.map((s, i) => (
                                                <div key={i} className="student-session-row">
                                                    <span className="ssrow-title">{s.title}</span>
                                                    <span className="ssrow-subject">{s.subject}</span>
                                                    <span className="ssrow-date">
                                                        {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {student.requests.length > 0 && (
                                    <div className="student-section">
                                        <p className="student-section-label">1-on-1 Requests</p>
                                        <div className="student-request-list">
                                            {student.requests.map(req => (
                                                <div key={req.id} className="student-req-row">
                                                    <span className="sreq-subject">{req.subject.charAt(0).toUpperCase() + req.subject.slice(1)}</span>
                                                    <span className="sreq-date">
                                                        {new Date(req.preferredDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="sreq-status" style={{ color: statusColor(req.status) }}>
                                                        {statusLabel(req.status)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Students;
