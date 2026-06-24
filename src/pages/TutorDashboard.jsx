import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { videosData, quizzesData, problemsData, guidesData } from '../data/resourcesData';
import { lessonsData } from '../data/lessonsData';
import { subjects } from '../utils/subjectColors';
import ChatModal, { getReadKey } from '../components/ChatModal';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './TutorDashboard.css';

const SESSIONS_KEY = 'tutorPostedSessions';
const ROSTERS_KEY = 'sessionRosters';
const PROFILES_KEY = 'tutorProfiles';

function TutorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('sessions');

    // Sessions
    const [mySessions, setMySessions] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [expandedRoster, setExpandedRoster] = useState(null);
    const [newSession, setNewSession] = useState({ title: '', subject: '', topic: '', description: '', date: '', time: '', totalSize: 6 });

    // Profile
    const [profile, setProfile] = useState({ name: '', bio: '', subjects: [], availability: '' });
    const [profileSaved, setProfileSaved] = useState(false);

    // Resources
    const [resourceTab, setResourceTab] = useState('videos');
    const [subjectFilter, setSubjectFilter] = useState('all');

    // Requests
    const [requests, setRequests] = useState([]);
    const [acceptModal, setAcceptModal] = useState(null);
    const [meetingLink, setMeetingLink] = useState('');
    const [editLinkModal, setEditLinkModal] = useState(null);
    const [editLinkValue, setEditLinkValue] = useState('');

    // Chat
    const [chatSession, setChatSession] = useState(null);
    const [unreadMap, setUnreadMap] = useState({});

    // Notification
    const [notif, setNotif] = useState('');

    useEffect(() => {
        loadMySessions();
        loadProfile();
        loadRequests();
    }, []);

    // Subscribe to last message of each accepted request for unread badge
    useEffect(() => {
        if (!user) return;
        const accepted = requests.filter(r => r.status === 'accepted');
        if (!accepted.length) return;

        const unsubs = accepted.map(req => {
            const q = query(
                collection(db, 'conversations', req.id, 'messages'),
                orderBy('timestamp', 'desc'),
                limit(1)
            );
            return onSnapshot(q, snap => {
                if (snap.empty) return;
                const msg = snap.docs[0].data();
                if (msg.senderId === user.uid) {
                    setUnreadMap(prev => ({ ...prev, [req.id]: false }));
                    return;
                }
                const lastRead = localStorage.getItem(getReadKey(user.uid, req.id));
                const msgTime = msg.timestamp?.toDate?.()?.getTime() || Date.now();
                const readTime = lastRead ? new Date(lastRead).getTime() : 0;
                setUnreadMap(prev => ({ ...prev, [req.id]: msgTime > readTime }));
            });
        });

        return () => unsubs.forEach(u => u());
    }, [requests, user]);

    const notify = (msg) => {
        setNotif(msg);
        setTimeout(() => setNotif(''), 3000);
    };

    // ── Sessions ──────────────────────────────────────────────
    const loadMySessions = () => {
        const saved = localStorage.getItem(SESSIONS_KEY);
        const all = saved ? JSON.parse(saved) : [];
        setMySessions(all.filter(s => s.tutorId === user?.uid));
    };

    const handlePostSession = () => {
        const { title, subject, topic, date, time, totalSize, description } = newSession;
        if (!title || !subject || !topic || !date || !time) return;
        const session = {
            id: `tutor-${user.uid}-${Date.now()}`,
            title, subject, topic: topic.toLowerCase(), description,
            date, time, totalSize: parseInt(totalSize), currentSize: 0,
            tutorEmail: user.email, tutorId: user.uid,
            instructor: profile.name || user.email.split('@')[0],
        };
        const saved = localStorage.getItem(SESSIONS_KEY);
        const all = saved ? JSON.parse(saved) : [];
        all.push(session);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
        setNewSession({ title: '', subject: '', topic: '', description: '', date: '', time: '', totalSize: 6 });
        setShowPostModal(false);
        loadMySessions();
        notify('Session posted! Students can see it on the Schedule page.');
    };

    const handleCancelSession = (sessionId) => {
        const saved = localStorage.getItem(SESSIONS_KEY);
        const all = saved ? JSON.parse(saved) : [];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(all.filter(s => s.id !== sessionId)));
        loadMySessions();
        notify('Session cancelled.');
    };

    const getRoster = (sessionId) => {
        const saved = localStorage.getItem(ROSTERS_KEY);
        const all = saved ? JSON.parse(saved) : {};
        return all[sessionId] || [];
    };

    const getSessionCount = (sessionId) => {
        const saved = localStorage.getItem('groupSessionCounts');
        const counts = saved ? JSON.parse(saved) : {};
        return counts[sessionId] || 0;
    };

    const isUpcoming = (date, time) => new Date(`${date}T${time}`) >= new Date();

    const formatDateTime = (date, time) => {
        const d = new Date(`${date}T${time}`);
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const t = `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
        return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${t}`;
    };

    const upcoming = mySessions.filter(s => isUpcoming(s.date, s.time));
    const past = mySessions.filter(s => !isUpcoming(s.date, s.time));

    // ── Profile ───────────────────────────────────────────────
    const loadProfile = () => {
        const saved = localStorage.getItem(PROFILES_KEY);
        const all = saved ? JSON.parse(saved) : {};
        if (all[user?.uid]) setProfile(all[user.uid]);
    };

    const handleSaveProfile = () => {
        const saved = localStorage.getItem(PROFILES_KEY);
        const all = saved ? JSON.parse(saved) : {};
        all[user.uid] = { ...profile, email: user.email };
        localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
        notify('Profile saved! Students can now see you on the Schedule page.');
    };

    const toggleSubject = (subj) => {
        setProfile(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subj)
                ? prev.subjects.filter(s => s !== subj)
                : [...prev.subjects, subj]
        }));
    };

    // ── Requests ──────────────────────────────────────────────
    const loadRequests = () => {
        const saved = localStorage.getItem('oneOnOneRequests');
        const all = saved ? JSON.parse(saved) : [];
        setRequests(all.filter(r => r.tutorId === user?.uid));
    };

    const handleRespondRequest = (reqId, status, link = '') => {
        const saved = localStorage.getItem('oneOnOneRequests');
        const all = saved ? JSON.parse(saved) : [];
        const updated = all.map(r => r.id === reqId ? { ...r, status, meetingLink: link } : r);
        localStorage.setItem('oneOnOneRequests', JSON.stringify(updated));
        loadRequests();
        notify(status === 'accepted' ? 'Request accepted! The student can see the meeting link.' : status === 'cancelled' ? 'Session cancelled.' : 'Request declined.');
    };

    const handleSaveLink = () => {
        if (!editLinkModal) return;
        const saved = localStorage.getItem('oneOnOneRequests');
        const all = saved ? JSON.parse(saved) : [];
        const updated = all.map(r => r.id === editLinkModal.id ? { ...r, meetingLink: editLinkValue.trim() } : r);
        localStorage.setItem('oneOnOneRequests', JSON.stringify(updated));
        loadRequests();
        setEditLinkModal(null);
        setEditLinkValue('');
        notify('Meeting link updated! The student can now join.');
    };

    const handleConfirmAccept = () => {
        if (!acceptModal) return;
        handleRespondRequest(acceptModal.id, 'accepted', meetingLink.trim());
        setAcceptModal(null);
        setMeetingLink('');
    };

    // ── Resources ─────────────────────────────────────────────
    const resourceTabs = [
        { id: 'videos', label: 'Videos', data: videosData },
        { id: 'lessons', label: 'Lessons', data: lessonsData },
        { id: 'quizzes', label: 'Quizzes', data: quizzesData },
        { id: 'problems', label: 'Problems', data: problemsData },
    ];
    const currentResourceData = resourceTabs.find(t => t.id === resourceTab)?.data || [];
    const filterBySubject = (arr) => subjectFilter === 'all' ? arr : arr.filter(i => i.topic === subjectFilter);

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const tabs = [
        { id: 'sessions', label: 'My Sessions' },
        { id: 'requests', label: `Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
        { id: 'hours', label: 'Hours & Certificate' },
        { id: 'resources', label: 'Resource Library' },
    ];

    // ── Service Hours ─────────────────────────────────────────
    const acceptedRequests = requests.filter(r => r.status === 'accepted');
    const totalHours = acceptedRequests.length; // 1 hour per session

    // Ratings received from students
    const allRatings = JSON.parse(localStorage.getItem('tutorRatings') || '{}');
    const myRatings = allRatings[user?.uid] || [];
    const avgRating = myRatings.length > 0
        ? (myRatings.reduce((s, r) => s + r.rating, 0) / myRatings.length).toFixed(1)
        : null;

    function downloadCertificate() {
        const tutorName = profile.name || user?.email?.split('@')[0] || 'Tutor';
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const html = `<!DOCTYPE html><html><head>
<title>Service Hour Certificate — Equalizer Learning Hub</title>
<style>
  body { font-family: Georgia, serif; margin: 0; padding: 40px; background: #f8fafc; }
  .cert { max-width: 700px; margin: 0 auto; background: white; border: 6px solid rgb(8,8,85); border-radius: 12px; padding: 48px 56px; text-align: center; }
  .cert-header { font-size: 13px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
  .cert-title { font-size: 34px; font-weight: 900; color: rgb(8,8,85); margin: 0 0 8px; }
  .cert-sub { font-size: 14px; color: #64748b; margin: 0 0 28px; }
  .cert-divider { height: 2px; background: linear-gradient(90deg, transparent, rgb(8,8,85), transparent); margin: 24px 0; }
  .cert-body { font-size: 17px; color: #374151; line-height: 1.8; margin-bottom: 28px; }
  .cert-name { font-size: 28px; font-weight: 900; color: rgb(8,8,85); margin: 8px 0; }
  .cert-hours { font-size: 42px; font-weight: 900; color: rgb(8,8,85); line-height: 1; }
  .cert-hours-label { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 24px; }
  .cert-sessions { text-align: left; margin: 20px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f1f5f9; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #374151; text-align: left; }
  .cert-footer { margin-top: 36px; font-size: 12px; color: #94a3b8; }
  .cert-sig { margin-top: 32px; display: flex; justify-content: space-around; }
  .sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; color: #94a3b8; min-width: 160px; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head><body>
<div class="cert">
  <div class="cert-header">Equalizer Learning Hub · Official Document</div>
  <div class="cert-title">Service Hour Certificate</div>
  <div class="cert-sub">This certifies that the following student has completed verified peer tutoring hours</div>
  <div class="cert-divider"></div>
  <div class="cert-body">This is to certify that</div>
  <div class="cert-name">${tutorName}</div>
  <div class="cert-body">has completed</div>
  <div class="cert-hours">${totalHours}</div>
  <div class="cert-hours-label">Verified Service Hour${totalHours !== 1 ? 's' : ''}</div>
  <div class="cert-body">as a certified peer math tutor on the Equalizer Learning Hub platform</div>
  ${acceptedRequests.length > 0 ? `
  <div class="cert-sessions">
    <table>
      <tr><th>Student</th><th>Subject</th><th>Date</th><th>Duration</th></tr>
      ${acceptedRequests.map(r => `<tr><td>${r.studentEmail || 'Student'}</td><td>${r.subject || 'Math'}</td><td>${r.preferredDate || 'See platform'}</td><td>1 hour</td></tr>`).join('')}
    </table>
  </div>` : ''}
  <div class="cert-divider"></div>
  <div class="cert-sig">
    <div class="sig-line">Equalizer Learning Hub<br>Platform Verification</div>
    <div class="sig-line">Faculty Advisor<br>Authorized Signature</div>
    <div class="sig-line">${date}<br>Date of Issue</div>
  </div>
  <div class="cert-footer">Generated ${date} · ${user?.email} · Equalizer Learning Hub · equalizer.edu</div>
</div>
<div class="no-print" style="text-align:center;margin-top:20px">
  <button onclick="window.print()" style="padding:12px 28px;background:rgb(8,8,85);color:white;border:none;border-radius:25px;font-size:16px;cursor:pointer">Print / Save as PDF</button>
</div>
</body></html>`;
        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
    }

    return (
        <div className="tutor-page">
            {notif && <div className="tutor-notification" role="status">{notif}</div>}

            {/* Header */}
            <div className="tutor-header">
                <div className="tutor-header-content">
                    <div className="tutor-identity">
                        <span className="tutor-badge-pill">Tutor</span>
                        <h1>{profile.name || 'Tutor Hub'}</h1>
                        <p className="tutor-email">{user?.email}</p>
                    </div>
                    <div className="tutor-header-stats">
                        <div className="th-stat"><span className="ths-num">{upcoming.length}</span><span className="ths-label">Upcoming Sessions</span></div>
                        <div className="th-stat"><span className="ths-num">{past.length}</span><span className="ths-label">Past Sessions</span></div>
                        <div className="th-stat"><span className="ths-num">{requests.filter(r => r.status === 'pending').length}</span><span className="ths-label">Pending Requests</span></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tutor-main-tabs">
                {tabs.map(t => (
                    <button key={t.id} className={`tutor-main-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="tutor-body">

                {/* ── MY SESSIONS ── */}
                {activeTab === 'sessions' && (
                    <div className="tutor-sessions-view">
                        <div className="sessions-view-header">
                            <h2>My Posted Sessions</h2>
                            <button className="post-session-btn" onClick={() => setShowPostModal(true)}>+ Post New Session</button>
                        </div>
                        <p className="sessions-hint">Sessions you post appear on the <strong>Schedule</strong> page where students can join them.</p>

                        {mySessions.length === 0 ? (
                            <div className="no-sessions-empty">
                                <div className="no-sessions-icon"></div>
                                <h3>No sessions posted yet</h3>
                                <p>Click "Post New Session" to create a session students can join.</p>
                                <button className="post-session-btn" onClick={() => setShowPostModal(true)}>+ Post New Session</button>
                            </div>
                        ) : (
                            <>
                                {upcoming.length > 0 && (
                                    <>
                                        <h3 className="session-group-label">Upcoming</h3>
                                        <div className="posted-sessions-list">
                                            {upcoming.map(session => {
                                                const subj = subjects.find(s => s.name.toLowerCase() === session.topic) || subjects[0];
                                                const joinedCount = getSessionCount(session.id);
                                                const roster = getRoster(session.id);
                                                const isExpanded = expandedRoster === session.id;
                                                return (
                                                    <div key={session.id} className="posted-session-card">
                                                        <div className="psc-left">
                                                            <div className="psc-icon" style={{ background: subj.color }}>{subj.icon}</div>
                                                        </div>
                                                        <div className="psc-body">
                                                            <div className="psc-top">
                                                                <h4>{session.title}</h4>
                                                                <span className="psc-subject">{session.subject}</span>
                                                            </div>
                                                            <p className="psc-time">{formatDateTime(session.date, session.time)}</p>
                                                            {session.description && <p className="psc-desc">{session.description}</p>}
                                                            <div className="psc-spots">
                                                                <div className="spots-bar">
                                                                    <div className="spots-fill" style={{ width: `${(joinedCount / session.totalSize) * 100}%`, background: subj.color }} />
                                                                </div>
                                                                <span className="spots-text">{joinedCount} / {session.totalSize} students joined</span>
                                                            </div>

                                                            {/* Roster */}
                                                            <button
                                                                className="view-roster-btn"
                                                                onClick={() => setExpandedRoster(isExpanded ? null : session.id)}
                                                            >
                                                                {isExpanded ? '▲ Hide Students' : `▼ View Students (${roster.length})`}
                                                            </button>
                                                            {isExpanded && (
                                                                <div className="roster-list">
                                                                    {roster.length === 0 ? (
                                                                        <p className="roster-empty">No students have joined yet.</p>
                                                                    ) : (
                                                                        roster.map((s, i) => (
                                                                            <div key={i} className="roster-item">
                                                                                <div className="roster-avatar">{s.email.charAt(0).toUpperCase()}</div>
                                                                                <div>
                                                                                    <div className="roster-email">{s.email}</div>
                                                                                    <div className="roster-date">Joined {new Date(s.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="psc-actions">
                                                            <button className="cancel-session-btn" onClick={() => handleCancelSession(session.id)}>Cancel</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                                {past.length > 0 && (
                                    <>
                                        <h3 className="session-group-label past-label">Past Sessions</h3>
                                        <div className="posted-sessions-list">
                                            {past.map(session => {
                                                const subj = subjects.find(s => s.name.toLowerCase() === session.topic) || subjects[0];
                                                const roster = getRoster(session.id);
                                                return (
                                                    <div key={session.id} className="posted-session-card past">
                                                        <div className="psc-left">
                                                            <div className="psc-icon" style={{ background: subj.color, opacity: 0.5 }}>{subj.icon}</div>
                                                        </div>
                                                        <div className="psc-body">
                                                            <div className="psc-top">
                                                                <h4>{session.title}</h4>
                                                                <span className="psc-subject">{session.subject}</span>
                                                            </div>
                                                            <p className="psc-time">{formatDateTime(session.date, session.time)}</p>
                                                            <p className="psc-desc">{roster.length} student{roster.length !== 1 ? 's' : ''} attended</p>
                                                        </div>
                                                        <div className="psc-actions">
                                                            <button className="remove-past-btn" onClick={() => handleCancelSession(session.id)}>Remove</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── MY PROFILE ── */}
                {activeTab === 'profile' && (
                    <div className="tutor-profile-view">
                        <div className="profile-header">
                            <div>
                                <h2>My Tutor Profile</h2>
                                <p className="sessions-hint">This information is shown to students on the Schedule page so they can find and book you.</p>
                            </div>
                            {profile.name && (
                                <div className="profile-preview-badge">
                                    <span>Visible to students</span>
                                </div>
                            )}
                        </div>

                        <div className="profile-form">
                            <div className="profile-avatar-section">
                                <div className="profile-avatar-large">
                                    {(profile.name || user?.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <p className="avatar-hint">Your avatar is auto-generated from your name</p>
                            </div>

                            <div className="form-group">
                                <label>Display Name <span className="req">*</span></label>
                                <input type="text" placeholder="e.g., Omar A." value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                <span className="field-hint">This is the name students will see</span>
                            </div>

                            <div className="form-group">
                                <label>Bio / About Me</label>
                                <textarea placeholder="Tell students about yourself - your grade, what you're good at, your tutoring style..." value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={4} />
                            </div>

                            <div className="form-group">
                                <label>Subjects I Tutor</label>
                                <div className="subject-checkboxes">
                                    {subjects.map(s => (
                                        <button
                                            key={s.name}
                                            type="button"
                                            className={`subject-check-btn ${profile.subjects.includes(s.name.toLowerCase()) ? 'checked' : ''}`}
                                            onClick={() => toggleSubject(s.name.toLowerCase())}
                                        >
                                            {s.icon} {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Availability</label>
                                <input type="text" placeholder="e.g., Mon–Fri after 3pm, weekends by appointment"
                                    value={profile.availability}
                                    onChange={e => setProfile({ ...profile, availability: e.target.value })} />
                            </div>

                            <button
                                className={`save-profile-btn ${profileSaved ? 'saved' : ''}`}
                                onClick={handleSaveProfile}
                                disabled={!profile.name.trim()}
                            >
                                {profileSaved ? '✓ Saved!' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── REQUESTS ── */}
                {activeTab === 'requests' && (
                    <div className="tutor-requests-view">
                        <div className="sessions-view-header">
                            <div>
                                <h2>1-on-1 Session Requests</h2>
                                <p className="sessions-hint">Students who want a private session with you will appear here.</p>
                            </div>
                        </div>

                        {requests.length === 0 ? (
                            <div className="no-sessions-empty">
                                <div className="no-sessions-icon"></div>
                                <h3>No requests yet</h3>
                                <p>When a student sends you a session request, it'll show up here.</p>
                            </div>
                        ) : (
                            <div className="requests-list">
                                {requests.map(req => (
                                    <div key={req.id} className={`request-card request-${req.status}`}>
                                        <div className="req-avatar">{req.studentEmail.charAt(0).toUpperCase()}</div>
                                        <div className="req-body">
                                            <div className="req-top">
                                                <span className="req-student">{req.studentEmail}</span>
                                                <span className={`req-status-badge req-status-${req.status}`}>
                                                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="req-meta">
                                                <span className="req-subject">{req.subject.charAt(0).toUpperCase() + req.subject.slice(1)}</span>
                                                <span className="req-dot">·</span>
                                                <span>{new Date(req.preferredDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                <span className="req-dot">·</span>
                                                <span>{(() => { const [h,m] = req.preferredTime.split(':'); const hr = parseInt(h); return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`; })()}</span>
                                            </div>
                                            {req.message && <p className="req-message">"{req.message}"</p>}
                                            {req.status === 'accepted' && (
                                                <p className="req-link-preview">
                                                    {req.meetingLink
                                                        ? <><span className="req-link-label">Link:</span> <a href={req.meetingLink} target="_blank" rel="noopener noreferrer" className="req-link-url">{req.meetingLink}</a></>
                                                        : <span className="req-no-link">No link added yet</span>
                                                    }
                                                </p>
                                            )}
                                            <p className="req-sent">Sent {new Date(req.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                        <div className="req-actions">
                                            {req.status === 'pending' && (
                                                <>
                                                    <button className="req-accept-btn" onClick={() => { setAcceptModal(req); setMeetingLink(''); }}>Accept</button>
                                                    <button className="req-decline-btn" onClick={() => handleRespondRequest(req.id, 'declined')}>Decline</button>
                                                </>
                                            )}
                                            {req.status === 'accepted' && (
                                                <>
                                                    <button
                                                        className="req-chat-btn"
                                                        onClick={() => {
                                                            setChatSession({ id: req.id, otherName: req.studentEmail });
                                                            setUnreadMap(prev => ({ ...prev, [req.id]: false }));
                                                        }}
                                                    >
                                                        Chat{unreadMap[req.id] && <span className="chat-unread-dot" />}
                                                    </button>
                                                    <button className="req-edit-link-btn" onClick={() => { setEditLinkModal(req); setEditLinkValue(req.meetingLink || ''); }}>
                                                        {req.meetingLink ? 'Edit Link' : '+ Add Link'}
                                                    </button>
                                                    <button className="req-decline-btn" onClick={() => handleRespondRequest(req.id, 'cancelled')}>Cancel Session</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── HOURS & CERTIFICATE ── */}
                {activeTab === 'hours' && (
                    <div className="tutor-hours-view">
                        <div className="hours-summary">
                            <div className="hours-stat-card primary">
                                <div className="hours-big-num">{totalHours}</div>
                                <div className="hours-big-label">Verified Service Hours</div>
                                <div className="hours-sub">1 hour per accepted session</div>
                            </div>
                            <div className="hours-stat-card">
                                <div className="hours-big-num">{acceptedRequests.length}</div>
                                <div className="hours-big-label">Sessions Completed</div>
                            </div>
                            {avgRating && (
                                <div className="hours-stat-card">
                                    <div className="hours-big-num">{avgRating}★</div>
                                    <div className="hours-big-label">Average Rating</div>
                                    <div className="hours-sub">from {myRatings.length} review{myRatings.length !== 1 ? 's' : ''}</div>
                                </div>
                            )}
                        </div>

                        <div className="hours-cert-cta">
                            <div>
                                <h3>Download Your Service Hour Certificate</h3>
                                <p>Formatted for NHS, school records, or college applications. Opens a print-ready page — save as PDF from your browser.</p>
                            </div>
                            <button className="hours-download-btn" onClick={downloadCertificate}>
                                ↓ Download Certificate
                            </button>
                        </div>

                        <div className="hours-session-log">
                            <h3>Session Log</h3>
                            {acceptedRequests.length === 0 ? (
                                <div className="hours-empty">No accepted sessions yet. Once students book and you accept, sessions appear here.</div>
                            ) : (
                                <div className="hours-table-wrap">
                                    <table className="hours-table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Subject</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Duration</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {acceptedRequests.map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.studentEmail || 'Student'}</td>
                                                    <td><span className="hrs-subject-tag">{r.subject}</span></td>
                                                    <td>{r.preferredDate || '—'}</td>
                                                    <td>{r.preferredTime || '—'}</td>
                                                    <td>1 hr</td>
                                                    <td><span className="hrs-status-badge">Verified</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {myRatings.length > 0 && (
                            <div className="hours-reviews">
                                <h3>Reviews from Students</h3>
                                <div className="hours-reviews-list">
                                    {myRatings.map((r, i) => (
                                        <div key={i} className="hours-review-card">
                                            <div className="hrs-review-top">
                                                <span className="hrs-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                                <span className="hrs-review-date">{new Date(r.date).toLocaleDateString()}</span>
                                            </div>
                                            {r.comment && <p className="hrs-review-comment">"{r.comment}"</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── RESOURCE LIBRARY ── */}
                {activeTab === 'resources' && (
                    <div className="tutor-resources-view">
                        <h2 className="resources-view-title">Resource Library</h2>
                        <p className="resources-view-hint">Browse all available learning materials. Students access these through the Resources page.</p>
                        <div className="resource-type-tabs">
                            {resourceTabs.map(tab => (
                                <button key={tab.id} className={`rt-tab ${resourceTab === tab.id ? 'active' : ''}`} onClick={() => setResourceTab(tab.id)}>
                                    {tab.label} <span className="rt-count">({tab.data.length})</span>
                                </button>
                            ))}
                        </div>
                        <div className="subject-filter-row">
                            {['all', ...subjects.map(s => s.name.toLowerCase())].map(s => (
                                <button key={s} className={`subject-chip ${subjectFilter === s ? 'active' : ''}`} onClick={() => setSubjectFilter(s)}>
                                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="resource-list">
                            {filterBySubject(currentResourceData).map(item => (
                                <div key={item.id} className="resource-row">
                                    <div className={`resource-type-badge ${resourceTab}`}>{resourceTab.slice(0, 3).toUpperCase()}</div>
                                    <div className="resource-info">
                                        <h4>{item.title}</h4>
                                        <span className="resource-meta">
                                            {item.topic} • {item.difficulty || item.level}{item.duration ? ` • ${item.duration}` : ''}{item.questions ? ` • ${item.questions.length} questions` : ''}
                                        </span>
                                    </div>
                                    <button className="resource-open-btn" onClick={() => {
                                        if (resourceTab === 'videos') { localStorage.setItem('currentVideo', JSON.stringify(item)); navigate('/video'); }
                                        if (resourceTab === 'lessons') { localStorage.setItem('currentLesson', JSON.stringify(item)); navigate('/lesson'); }
                                        if (resourceTab === 'quizzes') { localStorage.setItem('currentQuiz', JSON.stringify(item)); navigate('/quiz'); }
                                        if (resourceTab === 'problems') { localStorage.setItem('currentProblem', JSON.stringify(item)); navigate('/problems'); }
                                    }}>Preview</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Post Session Modal */}
            {showPostModal && (
                <div className="modal-overlay" onClick={() => setShowPostModal(false)} role="presentation">
                    <div className="modal-content wide-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Post a New Session</h2>
                            <button className="modal-close" onClick={() => setShowPostModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Session Title</label>
                                <input type="text" placeholder="e.g., Algebra 2 Review" value={newSession.title}
                                    onChange={e => setNewSession({ ...newSession, title: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input type="text" placeholder="e.g., Algebra 2" value={newSession.subject}
                                        onChange={e => setNewSession({ ...newSession, subject: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Topic</label>
                                    <select value={newSession.topic} onChange={e => setNewSession({ ...newSession, topic: e.target.value })}>
                                        <option value="">Select topic</option>
                                        {subjects.map(s => <option key={s.name} value={s.name.toLowerCase()}>{s.icon} {s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description <span className="optional-label">(optional)</span></label>
                                <textarea placeholder="What will you cover? What should students bring?" value={newSession.description}
                                    onChange={e => setNewSession({ ...newSession, description: e.target.value })} rows={3} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" value={newSession.date} min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setNewSession({ ...newSession, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input type="time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Max Students</label>
                                    <select value={newSession.totalSize} onChange={e => setNewSession({ ...newSession, totalSize: e.target.value })}>
                                        {[2,3,4,5,6,8,10,12,15,20].map(n => <option key={n} value={n}>{n} students</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowPostModal(false)}>Cancel</button>
                            <button className="submit-btn" onClick={handlePostSession}
                                disabled={!newSession.title || !newSession.subject || !newSession.topic || !newSession.date || !newSession.time}>
                                Post Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accept Request Modal */}
            {acceptModal && (
                <div className="modal-overlay" onClick={() => setAcceptModal(null)} role="presentation">
                    <div className="modal-content" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Accept Session Request</h2>
                            <button className="modal-close" onClick={() => setAcceptModal(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="accept-req-preview">
                                <div className="accept-req-row">
                                    <span className="accept-req-label">Student</span>
                                    <span className="accept-req-value">{acceptModal.studentEmail}</span>
                                </div>
                                <div className="accept-req-row">
                                    <span className="accept-req-label">Subject</span>
                                    <span className="accept-req-value">{acceptModal.subject.charAt(0).toUpperCase() + acceptModal.subject.slice(1)}</span>
                                </div>
                                <div className="accept-req-row">
                                    <span className="accept-req-label">Requested</span>
                                    <span className="accept-req-value">
                                        {new Date(acceptModal.preferredDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        {' at '}
                                        {(() => { const [h,m] = acceptModal.preferredTime.split(':'); const hr = parseInt(h); return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`; })()}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <label>Meeting Link <span className="optional-label">(optional but recommended)</span></label>
                                <input
                                    type="url"
                                    placeholder="e.g., https://meet.google.com/abc-xyz"
                                    value={meetingLink}
                                    onChange={e => setMeetingLink(e.target.value)}
                                />
                                <span className="field-hint">Google Meet, Zoom, Teams - paste any video call link. The student will see this on their dashboard.</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setAcceptModal(null)}>Cancel</button>
                            <button className="submit-btn" onClick={handleConfirmAccept}>Confirm &amp; Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {chatSession && (
                <ChatModal
                    requestId={chatSession.id}
                    otherName={chatSession.otherName}
                    onClose={() => setChatSession(null)}
                />
            )}

            {/* Edit Meeting Link Modal */}
            {editLinkModal && (
                <div className="modal-overlay" onClick={() => setEditLinkModal(null)} role="presentation">
                    <div className="modal-content" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editLinkModal.meetingLink ? 'Edit Meeting Link' : 'Add Meeting Link'}</h2>
                            <button className="modal-close" onClick={() => setEditLinkModal(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="sessions-hint">This will be shared with <strong>{editLinkModal.studentEmail}</strong> on their dashboard.</p>
                            <div className="form-group">
                                <label>Meeting Link</label>
                                <input
                                    type="url"
                                    placeholder="e.g., https://meet.google.com/abc-xyz"
                                    value={editLinkValue}
                                    onChange={e => setEditLinkValue(e.target.value)}
                                    autoFocus
                                />
                                <span className="field-hint">Google Meet, Zoom, Teams - any video call link works.</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setEditLinkModal(null)}>Cancel</button>
                            <button className="submit-btn" onClick={handleSaveLink}>Save Link</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default TutorDashboard;
