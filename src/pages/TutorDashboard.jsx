import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { videosData, quizzesData, problemsData, guidesData } from '../data/resourcesData';
import { lessonsData } from '../data/lessonsData';
import { subjects } from '../utils/subjectColors';
import MessagesPanel from '../components/MessagesPanel';
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

    // Messages
    const [preCompose, setPreCompose] = useState(null);
    const [msgUnread, setMsgUnread] = useState(0);

    // Notification
    const [notif, setNotif] = useState('');

    useEffect(() => {
        loadMySessions();
        loadProfile();
        loadRequests();
    }, []);


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
        { id: 'messages', label: `Messages${msgUnread > 0 ? ` (${msgUnread})` : ''}` },
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
        const html = `<!DOCTYPE html>
<html>
<head>
<title>Service Hour Certificate - Equalizer Learning Hub</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Dancing+Script:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #e2e8f0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 36px 20px;
  }

  .cert-wrap {
    position: relative;
    width: 100%;
    max-width: 1060px;
    background: white;
    box-shadow: 0 24px 64px rgba(0,0,0,0.22);
    overflow: hidden;
    min-height: 680px;
    display: flex;
    flex-direction: column;
  }

  /* Dot pattern — right side decoration */
  .cert-dots {
    position: absolute;
    top: 0; right: 0;
    width: 42%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  /* Badge top right */
  .cert-badge {
    position: absolute;
    top: 28px;
    right: 60px;
    width: 148px;
    height: 148px;
    z-index: 2;
  }

  /* ── Top logo strip ── */
  .cert-logo-strip {
    position: relative;
    z-index: 1;
    padding: 36px 52px 0;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-mark {
    width: 44px; height: 44px;
    background: rgb(8,8,85);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .logo-mark span {
    color: white; font-size: 17px; font-weight: 800; letter-spacing: -1px; line-height: 1;
  }
  .logo-text-block .org { font-size: 10px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #64748b; display: block; }
  .logo-text-block .prog { font-size: 19px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: rgb(8,8,85); display: block; line-height: 1.1; }

  /* ── Main content ── */
  .cert-body-wrap {
    position: relative;
    z-index: 1;
    padding: 44px 52px 36px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 660px;
  }

  .cert-top { }

  .cert-name {
    font-size: 58px;
    font-weight: 300;
    color: #0f172a;
    line-height: 1.05;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
  }

  .cert-presents {
    font-size: 15px;
    color: #64748b;
    font-weight: 400;
    margin-bottom: 6px;
  }

  .cert-achievement {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 28px;
  }

  /* Sessions table */
  .cert-sessions { margin: 0 0 16px; }
  .cert-sessions-label { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; display: block; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; max-width: 560px; }
  th { background: rgb(8,8,85); color: white; padding: 7px 12px; font-size: 9.5px; text-transform: uppercase; letter-spacing: .07em; font-weight: 700; text-align: left; }
  td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; color: #374151; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #f8fafc; }

  /* ── Bottom signatures ── */
  .cert-bottom {
    display: flex;
    align-items: flex-end;
    gap: 48px;
    padding-top: 28px;
    border-top: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }

  .sig-block { min-width: 160px; }
  .sig-name {
    font-family: 'Dancing Script', cursive;
    font-size: 34px;
    font-weight: 700;
    color: #0f172a;
    display: block;
    line-height: 1.1;
    margin-bottom: 6px;
  }
  .sig-line { border-top: 1.5px solid #334155; margin-bottom: 6px; width: 180px; display: block; }
  .sig-label { font-size: 12px; font-weight: 700; color: #0f172a; display: block; }
  .sig-role { font-size: 11px; color: #64748b; display: block; margin-top: 1px; }

  .cert-meta { }
  .meta-value { font-size: 15px; font-weight: 600; color: #0f172a; display: block; }
  .meta-label { font-size: 11px; color: #94a3b8; display: block; margin-top: 3px; }

  .cert-footer { margin-top: 20px; font-size: 10px; color: #cbd5e1; letter-spacing: .04em; }

  @media print {
    @page { size: landscape; margin: 0; }
    body { background: white; padding: 0; }
    .cert-wrap { box-shadow: none; max-width: 100%; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="cert-wrap">

  <!-- Dot grid + math symbol accents (right side, fades left) -->
  <svg class="cert-dots" viewBox="0 0 440 680" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect x="7" y="7" width="5" height="5" rx="1" fill="rgb(8,8,85)" opacity="0.12"/>
      </pattern>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="white" stop-opacity="1"/>
        <stop offset="40%" stop-color="white" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- Uniform dot grid -->
    <rect width="440" height="680" fill="url(#dots)"/>
    <!-- Math symbol accents -->
    <g font-family="Inter,system-ui,sans-serif" font-weight="700" fill="rgb(8,8,85)">
      <text x="196" y="48"  font-size="14" opacity="0.32">&#960;</text>
      <text x="256" y="24"  font-size="12" opacity="0.28" fill="#2563eb">+</text>
      <text x="306" y="66"  font-size="16" opacity="0.30">&#8730;</text>
      <text x="346" y="34"  font-size="13" opacity="0.27" fill="#1e40af">=</text>
      <text x="388" y="60"  font-size="18" opacity="0.33">&#215;</text>
      <text x="218" y="106" font-size="13" opacity="0.28" fill="#2563eb">%</text>
      <text x="376" y="116" font-size="12" opacity="0.30">&#247;</text>
      <text x="296" y="146" font-size="15" opacity="0.26" fill="#1e40af">&#178;</text>
      <text x="238" y="186" font-size="13" opacity="0.28">&#8722;</text>
      <text x="406" y="176" font-size="16" opacity="0.32" fill="#2563eb">&#8730;</text>
      <text x="326" y="206" font-size="12" opacity="0.27">+</text>
      <text x="186" y="266" font-size="16" opacity="0.22" fill="#1e40af">=</text>
      <text x="356" y="284" font-size="13" opacity="0.28">&#960;</text>
      <text x="276" y="326" font-size="15" opacity="0.25" fill="#2563eb">&#215;</text>
      <text x="416" y="346" font-size="14" opacity="0.31">%</text>
      <text x="206" y="406" font-size="12" opacity="0.24" fill="#1e40af">&#247;</text>
      <text x="386" y="426" font-size="18" opacity="0.30">&#178;</text>
      <text x="306" y="466" font-size="13" opacity="0.27" fill="#2563eb">&#8730;</text>
      <text x="246" y="506" font-size="15" opacity="0.26">+</text>
      <text x="426" y="516" font-size="12" opacity="0.32" fill="#1e40af">&#215;</text>
      <text x="196" y="566" font-size="14" opacity="0.24">=</text>
      <text x="366" y="586" font-size="16" opacity="0.29" fill="#2563eb">&#960;</text>
      <text x="286" y="626" font-size="13" opacity="0.27">&#247;</text>
      <text x="436" y="646" font-size="15" opacity="0.31" fill="#1e40af">&#8730;</text>
    </g>
    <!-- Left fade overlay -->
    <rect width="440" height="680" fill="url(#fade)"/>
  </svg>

  <!-- Badge (top right) -->
  <svg class="cert-badge" viewBox="0 0 148 148" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer ring -->
    <circle cx="74" cy="74" r="70" fill="none" stroke="rgb(8,8,85)" stroke-width="2" opacity="0.15"/>
    <circle cx="74" cy="74" r="62" fill="rgb(8,8,85)"/>
    <circle cx="74" cy="74" r="54" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
    <!-- Star -->
    <polygon points="74,38 80,62 106,62 85,77 92,101 74,87 56,101 63,77 42,62 68,62" fill="white" opacity="0.9"/>
    <!-- Wreath arcs (simple dashes) -->
    <circle cx="74" cy="74" r="48" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="4 3"/>
    <!-- Text around circle -->
    <path id="topArc" d="M 26,74 A 48,48 0 0,1 122,74" fill="none"/>
    <text font-size="8" font-weight="700" fill="white" letter-spacing="2" font-family="Inter,sans-serif" opacity="0.85">
      <textPath href="#topArc" startOffset="10%">EQUALIZER LEARNING HUB</textPath>
    </text>
    <path id="botArc" d="M 26,78 A 48,48 0 0,0 122,78" fill="none"/>
    <text font-size="7.5" font-weight="600" fill="white" letter-spacing="1.5" font-family="Inter,sans-serif" opacity="0.7">
      <textPath href="#botArc" startOffset="12%">PEER TUTOR PROGRAM</textPath>
    </text>
    <!-- Ribbon -->
    <rect x="62" y="124" width="24" height="28" rx="2" fill="#1e3a8a"/>
    <polygon points="62,152 74,144 86,152 86,170 62,170" fill="#0f172a" opacity="0.6"/>
  </svg>

  <!-- Logo strip -->
  <div class="cert-logo-strip">
    <div class="logo-mark"><span>EQ</span></div>
    <div class="logo-text-block">
      <span class="org">Student-Run Peer Tutoring</span>
      <span class="prog">Equalizer</span>
    </div>
  </div>

  <!-- Main body -->
  <div class="cert-body-wrap">
    <div class="cert-top">
      <div class="cert-name">${tutorName}</div>
      <p class="cert-presents">has successfully completed</p>
      <div class="cert-achievement">${totalHours} Verified Service Hour${totalHours !== 1 ? 's' : ''} &nbsp;·&nbsp; Peer Mathematics Tutoring</div>

      ${acceptedRequests.length > 0 ? `
      <div class="cert-sessions">
        <span class="cert-sessions-label">Session Record</span>
        <table>
          <tr><th>Student</th><th>Subject</th><th>Date</th><th>Duration</th></tr>
          ${acceptedRequests.map(r => `<tr><td>${r.studentEmail || 'Student'}</td><td>${r.subject || 'Math'}</td><td>${r.preferredDate || 'On Platform'}</td><td>1 hr</td></tr>`).join('')}
        </table>
      </div>` : ''}
    </div>

    <!-- Signatures row -->
    <div class="cert-bottom">
      <div class="sig-block">
        <span class="sig-name">Equalizer LH</span>
        <span class="sig-line"></span>
        <span class="sig-label">Equalizer Learning Hub</span>
        <span class="sig-role">Platform Verification</span>
      </div>
      <div class="sig-block">
        <span class="sig-name">Student Leadership</span>
        <span class="sig-line"></span>
        <span class="sig-label">Student Leadership Team</span>
        <span class="sig-role">Program Director</span>
      </div>
      <div class="cert-meta">
        <span class="meta-value">${date}</span>
        <span class="meta-label">Date Awarded</span>
      </div>
    </div>

    <div class="cert-footer">Equalizer Learning Hub &nbsp;·&nbsp; Student-created, student-verified &nbsp;·&nbsp; ${user?.email} &nbsp;·&nbsp; equalizer.edu</div>
  </div>
</div>

<div class="no-print" style="text-align:center;margin-top:28px;padding-bottom:36px">
  <button onclick="window.print()" style="padding:13px 34px;background:rgb(8,8,85);color:white;border:none;border-radius:8px;font-size:14px;font-family:Inter,sans-serif;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(8,8,85,0.3);letter-spacing:.03em">
    Print / Save as PDF
  </button>
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
                                                            setPreCompose({ to: req.studentEmail, subject: `Re: Your tutoring request` });
                                                            setActiveTab('messages');
                                                        }}
                                                    >
                                                        Message
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

            {/* ── MESSAGES ── */}
            {activeTab === 'messages' && (
                <div className="tutor-resources-view">
                    <MessagesPanel
                        userEmail={user?.email}
                        preCompose={preCompose}
                        onClearPreCompose={() => setPreCompose(null)}
                        onUnreadChange={setMsgUnread}
                    />
                </div>
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
