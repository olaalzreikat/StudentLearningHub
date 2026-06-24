import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ApplicationStatus.css';

const APPS_KEY = 'tutorApplications';

const TRAINING_ITEMS = [
    { id: 'guidelines', label: 'Read the Tutoring Guidelines', desc: 'Understand session expectations, no-show policy, and professionalism standards.' },
    { id: 'feedback', label: 'Complete the "How to Give Good Feedback" module', desc: 'Learn techniques for explaining concepts clearly and encouraging struggling students.' },
    { id: 'conduct', label: 'Review the Platform Code of Conduct', desc: 'Know what is and isn\'t acceptable in session communications and reviews.' },
    { id: 'profile', label: 'Set up your tutor profile', desc: 'Add your name, bio, subjects, and availability so students can find you.' },
    { id: 'hours', label: 'Understand how service hours are tracked', desc: 'Learn how sessions are logged and how to download your service hour certificate.' },
];

function StatusTimeline({ status }) {
    const steps = [
        { key: 'applied', label: 'Application Submitted', done: true },
        { key: 'quiz', label: 'Skills Quiz Completed', done: true },
        { key: 'review', label: 'Under Leadership Review', done: status === 'approved' || status === 'rejected' },
        { key: 'training', label: 'Training Completed', done: status === 'active' },
        { key: 'live', label: 'Profile Live', done: status === 'active' },
    ];

    return (
        <div className="status-timeline">
            {steps.map((step, i) => (
                <div key={step.key} className={`timeline-step ${step.done ? 'done' : ''} ${i === steps.findIndex(s => !s.done) ? 'current' : ''}`}>
                    <div className="timeline-dot">{step.done ? '✓' : (i === steps.findIndex(s => !s.done) ? '●' : '')}</div>
                    {i < steps.length - 1 && <div className="timeline-line" />}
                    <span className="timeline-label">{step.label}</span>
                </div>
            ))}
        </div>
    );
}

function ApplicationStatus() {
    const { user, switchRole } = useAuth();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [checked, setChecked] = useState({});
    const [activating, setActivating] = useState(false);

    useEffect(() => {
        if (!user) return;
        const apps = JSON.parse(localStorage.getItem(APPS_KEY) || '{}');
        setApp(apps[user.uid] || null);
        const savedChecked = JSON.parse(localStorage.getItem(`training-checked-${user.uid}`) || '{}');
        setChecked(savedChecked);
    }, [user]);

    function toggleCheck(id) {
        const updated = { ...checked, [id]: !checked[id] };
        setChecked(updated);
        localStorage.setItem(`training-checked-${user.uid}`, JSON.stringify(updated));
    }

    async function handleActivate() {
        setActivating(true);
        const apps = JSON.parse(localStorage.getItem(APPS_KEY) || '{}');
        if (apps[user.uid]) {
            apps[user.uid].status = 'active';
            localStorage.setItem(APPS_KEY, JSON.stringify(apps));
        }
        await switchRole('tutor');
        navigate('/dashboard');
    }

    const allTrainingDone = TRAINING_ITEMS.every(item => checked[item.id]);

    if (!user) return (
        <div className="appstatus-page">
            <div className="appstatus-card">
                <p>Please <Link to="/login">log in</Link> to check your application status.</p>
            </div>
        </div>
    );

    if (!app) return (
        <div className="appstatus-page">
            <div className="appstatus-card centered">
                <div className="appstatus-icon">?</div>
                <h2>No Application Found</h2>
                <p>You haven't submitted a tutor application yet. Start the process from your dashboard.</p>
                <Link to="/apply" className="appstatus-primary-btn">Start Application</Link>
                <button className="appstatus-ghost-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="appstatus-page">
            <div className="appstatus-header">
                <div className="appstatus-badge">Tutor Application</div>
                <h1>Application Status</h1>
                <p>Submitted {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <div className="appstatus-layout">
                {/* Left: Status card */}
                <div className="appstatus-main">
                    {app.status === 'pending_review' && (
                        <div className="appstatus-card status-pending">
                            <div className="status-badge pending">Under Review</div>
                            <h2>Your application is being reviewed</h2>
                            <p>Our leadership team reviews all applications with faculty advisor sign-off. This typically takes <strong>2–3 school days</strong>. We'll update your status here. No action needed on your part.</p>
                            <StatusTimeline status="pending_review" />
                        </div>
                    )}

                    {app.status === 'approved' && (
                        <div className="appstatus-card status-approved">
                            <div className="status-badge approved">Approved</div>
                            <h2>You've been approved!</h2>
                            <p>Complete the training checklist below to activate your tutor account and go live.</p>
                            <StatusTimeline status="approved" />

                            <div className="training-section">
                                <h3 className="training-title">Training Checklist</h3>
                                <p className="training-subtitle">Complete all 5 items to unlock your tutor account.</p>
                                <div className="training-list">
                                    {TRAINING_ITEMS.map(item => (
                                        <label key={item.id} className={`training-item ${checked[item.id] ? 'checked' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={!!checked[item.id]}
                                                onChange={() => toggleCheck(item.id)}
                                            />
                                            <div className="training-text">
                                                <span className="training-label">{item.label}</span>
                                                <span className="training-desc">{item.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="training-progress">
                                    <div className="training-bar-wrap">
                                        <div
                                            className="training-bar-fill"
                                            style={{ width: `${(Object.values(checked).filter(Boolean).length / TRAINING_ITEMS.length) * 100}%` }}
                                        />
                                    </div>
                                    <span>{Object.values(checked).filter(Boolean).length} / {TRAINING_ITEMS.length} complete</span>
                                </div>

                                <button
                                    className="appstatus-primary-btn activate-btn"
                                    disabled={!allTrainingDone || activating}
                                    onClick={handleActivate}
                                >
                                    {activating ? 'Activating…' : allTrainingDone ? 'Activate Tutor Account →' : `Complete all ${TRAINING_ITEMS.length} items first`}
                                </button>
                            </div>
                        </div>
                    )}

                    {app.status === 'rejected' && (
                        <div className="appstatus-card status-rejected">
                            <div className="status-badge rejected">Not Approved</div>
                            <h2>Application Not Approved</h2>
                            <p>Unfortunately your application wasn't approved at this time. This is often related to quiz score or the teacher reference. You're welcome to reapply after reviewing the material.</p>
                            {app.reviewNote && (
                                <div className="appstatus-note">
                                    <strong>Reviewer note:</strong> {app.reviewNote}
                                </div>
                            )}
                            <div className="appstatus-actions">
                                <Link to="/apply" className="appstatus-primary-btn">Reapply</Link>
                                <Link to="/resources" className="appstatus-ghost-btn">Study Resources</Link>
                            </div>
                        </div>
                    )}

                    {app.status === 'failed_quiz' && (
                        <div className="appstatus-card status-pending">
                            <div className="status-badge pending">Quiz Not Passed</div>
                            <h2>Quiz score was below the threshold</h2>
                            <p>You scored <strong>{app.quizScore}/15</strong>. You need 10/15 to pass. Your form information is saved. Just retake the quiz when you're ready.</p>
                            <div className="appstatus-actions">
                                <Link to="/apply" className="appstatus-primary-btn">Retake Quiz</Link>
                                <Link to="/resources" className="appstatus-ghost-btn">Study Resources</Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Application summary */}
                <div className="appstatus-sidebar">
                    <div className="appstatus-summary">
                        <h4>Your Submission</h4>
                        <div className="summary-row">
                            <span>Name</span>
                            <strong>{app.name}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Grade</span>
                            <strong>{app.grade}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Quiz Score</span>
                            <strong className={app.quizPassed ? 'text-green' : 'text-red'}>{app.quizScore}/15 {app.quizPassed ? '✓' : '✗'}</strong>
                        </div>
                        <div className="summary-subjects">
                            <span>Subjects</span>
                            <div className="summary-tags">
                                {app.subjects.map(s => <span key={s} className="summary-tag">{s}</span>)}
                            </div>
                        </div>
                        <div className="summary-row">
                            <span>Teacher Ref.</span>
                            <strong>{app.teacherRef?.name}</strong>
                        </div>
                    </div>

                    <div className="appstatus-help">
                        <h4>Questions?</h4>
                        <p>Contact our support team or check the FAQ.</p>
                        <Link to="/contact">Contact Support →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationStatus;
