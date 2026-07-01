import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './TutorApplication.css';

const PASS_THRESHOLD = 4; // 4 out of 5 per subject (80%)

const QUESTION_BANK = {
    'Algebra 1': [
        {
            q: 'Solve the system of equations: 2x + 3y = 12, x − y = 1',
            options: ['x = 3, y = 2', 'x = 4, y = 1', 'x = 2, y = 3', 'x = 5, y = 0'],
            answer: 0,
        },
        {
            q: 'Factor completely: 3x² − 12x − 36',
            options: ['(3x − 6)(x + 6)', '3(x − 6)(x + 2)', '3(x + 6)(x − 2)', '(x − 6)(3x + 6)'],
            answer: 1,
        },
        {
            q: 'The vertex of the parabola y = x² − 8x + 11 is at:',
            options: ['(4, −5)', '(8, 11)', '(−4, 5)', '(4, 5)'],
            answer: 0,
        },
        {
            q: 'Solve: |3x − 6| = 12',
            options: ['x = 6 only', 'x = −2 only', 'x = 6 and x = −2', 'x = 2 and x = −6'],
            answer: 2,
        },
        {
            q: 'How many real roots does f(x) = −2x² + 4x + 6 have?',
            options: ['0', '1', '2', 'Cannot be determined'],
            answer: 2,
        },
    ],
    'Algebra 2': [
        {
            q: 'The sum of the roots of 3x² − 7x + 2 = 0 is:',
            options: ['2/3', '7/3', '−7/3', '7'],
            answer: 1,
        },
        {
            q: 'Simplify: (x² − 9) / (x² − x − 6)',
            options: ['(x + 3)/(x + 2)', '(x − 3)/(x + 2)', '(x + 3)/(x − 2)', '(x − 3)/(x − 2)'],
            answer: 0,
        },
        {
            q: 'Evaluate: log₂(64)',
            options: ['4', '5', '6', '8'],
            answer: 2,
        },
        {
            q: 'Solve: 2^(x+1) = 32',
            options: ['x = 3', 'x = 4', 'x = 5', 'x = 16'],
            answer: 1,
        },
        {
            q: 'The vertex of y = 3|x − 2| + 1 is at:',
            options: ['(−2, 1)', '(2, 1)', '(2, 3)', '(0, 7)'],
            answer: 1,
        },
    ],
    'Geometry': [
        {
            q: 'A chord is 16 cm long and 6 cm from the center of the circle. The radius is:',
            options: ['8 cm', '9 cm', '10 cm', '12 cm'],
            answer: 2,
        },
        {
            q: 'Two similar triangles have areas in ratio 9:25. The ratio of their perimeters is:',
            options: ['3:5', '9:25', '81:625', '3:25'],
            answer: 0,
        },
        {
            q: 'In △ABC, ∠A = 35° and ∠B = 75°. The exterior angle at vertex C equals:',
            options: ['70°', '105°', '110°', '145°'],
            answer: 2,
        },
        {
            q: 'A sector has radius 9 and central angle 80°. Its area is:',
            options: ['12π', '18π', '20π', '24π'],
            answer: 1,
        },
        {
            q: 'Parallel lines are cut by a transversal. Co-interior angles are (3x + 20)° and (x + 60)°. Find x:',
            options: ['x = 20', 'x = 25', 'x = 30', 'x = 15'],
            answer: 1,
        },
    ],
    'Pre-Calculus': [
        {
            q: 'Find the period of f(x) = 4sin(3x − π/2)',
            options: ['π/3', '2π', '2π/3', '4π'],
            answer: 2,
        },
        {
            q: 'Convert 225° to radians:',
            options: ['4π/5', '3π/4', '5π/3', '5π/4'],
            answer: 3,
        },
        {
            q: 'If g(x) = x² + 1 and h(x) = 2x − 3, find g(h(x)):',
            options: ['4x² − 12x + 10', '2x² − 1', '4x² + 10', '2x² − 3'],
            answer: 0,
        },
        {
            q: 'The amplitude of f(x) = −3cos(2x) + 1 is:',
            options: ['−3', '1', '2', '3'],
            answer: 3,
        },
        {
            q: 'Which expression is equivalent to cos²(x)?',
            options: ['1 − sin²(x)', 'sin²(x) − 1', 'tan²(x) + 1', 'sec²(x) − 1'],
            answer: 0,
        },
    ],
    'Calculus AB': [
        {
            q: "If f(x) = sin(x²), then f'(x) =",
            options: ['cos(x²)', '2x · cos(x²)', '−sin(2x)', 'cos(2x)'],
            answer: 1,
        },
        {
            q: 'Find the x-value of the local minimum of f(x) = x³ − 3x² − 9x + 5:',
            options: ['x = −1', 'x = 3', 'x = −3', 'x = 1'],
            answer: 1,
        },
        {
            q: 'Evaluate: ∫₁³ (2x + 1) dx',
            options: ['8', '9', '10', '12'],
            answer: 2,
        },
        {
            q: 'The derivative of f(x) = (2x + 1)⁴ is:',
            options: ['4(2x + 1)³', '8(2x + 1)³', '(2x + 1)⁴', '4(2x + 1)⁴'],
            answer: 1,
        },
        {
            q: 'lim(x→2) [(x² − 4) / (x − 2)] =',
            options: ['0', '2', '4', 'undefined'],
            answer: 2,
        },
    ],
    'Statistics': [
        {
            q: 'For the sorted dataset 3, 5, 7, 8, 10, 12, 15, 20 — the IQR is:',
            options: ['5.5', '6', '7.5', '9'],
            answer: 2,
        },
        {
            q: 'In a positively skewed distribution:',
            options: ['Mean < Median', 'The tail extends to the left', 'Mean > Median', 'The data is perfectly symmetric'],
            answer: 2,
        },
        {
            q: 'P(A) = 0.4 and P(B) = 0.3. A and B are independent. Find P(A or B):',
            options: ['0.12', '0.58', '0.70', '0.88'],
            answer: 1,
        },
        {
            q: 'A data set has μ = 60 and σ = 8. By the empirical rule, what % of data falls between 44 and 76?',
            options: ['68%', '95%', '99.7%', '50%'],
            answer: 1,
        },
        {
            q: 'A student scored 78 on a test with mean 70 and SD = 5. Their z-score is:',
            options: ['0.8', '1.2', '1.6', '2.0'],
            answer: 2,
        },
    ],
    'Trigonometry': [
        {
            q: 'Simplify: sin²(x) / (1 − cos(x))',
            options: ['cos(x)', '1 − cos(x)', '1 + cos(x)', 'sin(x)'],
            answer: 2,
        },
        {
            q: 'Solve for x ∈ [0, 2π): 2sin(x) − √3 = 0',
            options: ['π/3 only', 'π/3 and 5π/3', 'π/3 and 2π/3', '2π/3 only'],
            answer: 2,
        },
        {
            q: 'In △ABC, a = 7, b = 9, ∠A = 45°. Using the Law of Sines, sin(B) =',
            options: ['7√2/18', '9/(7√2)', '9√2/14', '7/9'],
            answer: 2,
        },
        {
            q: 'The exact value of cos(π/12) is:',
            options: ['(√6 − √2)/4', '(√6 + √2)/4', '√3/2', '(1 + √3)/2'],
            answer: 1,
        },
        {
            q: 'tan(θ) = 3/4 and θ is in Quadrant III. Then sin(θ) =',
            options: ['3/5', '−4/5', '−3/5', '4/5'],
            answer: 2,
        },
    ],
};

const SUBJECT_COLORS = {
    'Algebra 1':   '#3b82f6',
    'Algebra 2':   '#6366f1',
    'Geometry':    '#8b5cf6',
    'Pre-Calculus':'#ec4899',
    'Calculus AB': '#ef4444',
    'Statistics':  '#10b981',
    'Trigonometry':'#f59e0b',
};

const TEACHABLE_SUBJECTS = ['Algebra 1', 'Algebra 2', 'Geometry', 'Pre-Calculus', 'Calculus AB', 'Statistics', 'Trigonometry'];
const GRADES = ['9th', '10th', '11th', '12th'];
const APPS_KEY = 'tutorApplications';

function saveApplication(userId, email, info, subjectScores, passedSubjects) {
    const appData = {
        userId,
        email,
        name: info.name,
        grade: info.grade,
        subjects: passedSubjects.length > 0 ? passedSubjects : info.subjects,
        allSelectedSubjects: info.subjects,
        reason: info.reason,
        teacherRef: { name: info.teacherName, subject: info.teacherSubject },
        subjectScores,
        status: passedSubjects.length > 0 ? 'pending_review' : 'failed_quiz',
        appliedAt: new Date().toISOString(),
    };
    // Save to localStorage for immediate access
    const apps = JSON.parse(localStorage.getItem(APPS_KEY) || '{}');
    apps[userId] = appData;
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
    // Save to Firestore so admin and student can access from any device
    setDoc(doc(db, 'tutorApplications', userId), appData, { merge: true }).catch(() => {});
}

function TutorApplication() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [phase, setPhase] = useState('intro');
    const [info, setInfo] = useState({
        name: '', grade: '', subjects: [], reason: '', teacherName: '', teacherSubject: '',
    });
    const [infoError, setInfoError] = useState('');
    const [answers, setAnswers] = useState({});
    const [subjectScores, setSubjectScores] = useState({});
    const [passedSubjects, setPassedSubjects] = useState([]);

    // Build flat quiz array from selected subjects (order preserved)
    const quizQuestions = info.subjects.flatMap(subj =>
        (QUESTION_BANK[subj] || []).map(q => ({ ...q, subject: subj }))
    );

    function handleInfoChange(e) {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
    }

    function handleSubjectToggle(subj) {
        setInfo(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subj)
                ? prev.subjects.filter(s => s !== subj)
                : [...prev.subjects, subj],
        }));
    }

    function handleInfoSubmit(e) {
        e.preventDefault();
        if (!info.name.trim()) return setInfoError('Please enter your full name.');
        if (!info.grade) return setInfoError('Please select your grade.');
        if (info.subjects.length === 0) return setInfoError('Select at least one subject you can teach.');
        if (info.reason.trim().length < 50) return setInfoError('Please write at least 50 characters explaining why you want to tutor.');
        if (!info.teacherName.trim() || !info.teacherSubject.trim()) return setInfoError('Please provide your teacher reference.');
        setInfoError('');
        setAnswers({});
        setPhase('quiz');
    }

    function handleSelect(globalIdx, optIdx) {
        setAnswers(prev => ({ ...prev, [globalIdx]: optIdx }));
    }

    function handleQuizSubmit() {
        const scores = {};
        info.subjects.forEach(subj => {
            const subjQs = quizQuestions.map((q, i) => ({ ...q, idx: i })).filter(q => q.subject === subj);
            const correct = subjQs.filter(q => answers[q.idx] === q.answer).length;
            scores[subj] = { correct, total: subjQs.length };
        });
        const passed = info.subjects.filter(s => scores[s].correct >= PASS_THRESHOLD);
        setSubjectScores(scores);
        setPassedSubjects(passed);
        if (user) saveApplication(user.uid, user.email, info, scores, passed);
        setPhase('result');
    }

    const answered = Object.keys(answers).length;
    const allAnswered = answered === quizQuestions.length && quizQuestions.length > 0;

    // ─── INTRO ───
    if (phase === 'intro') return (
        <div className="ta-page">
            <div className="ta-intro-card">
                <div className="ta-intro-badge">Tutor Application</div>
                <h1 className="ta-intro-title">Become a Student Tutor</h1>
                <p className="ta-intro-desc">
                    Built by students, for students. Tutors are peers who earn <strong>verified service hours</strong> while helping classmates succeed.
                </p>
                <div className="ta-intro-rules">
                    <div className="ta-rule">
                        <span className="ta-rule-icon">1.</span>
                        <div>
                            <strong>Application form</strong>
                            <p>Tell us about yourself, which subjects you want to teach, and provide a teacher reference.</p>
                        </div>
                    </div>
                    <div className="ta-rule">
                        <span className="ta-rule-icon">2.</span>
                        <div>
                            <strong>Subject-specific skills quiz</strong>
                            <p>5 curriculum-based questions per subject you select. You need 4/5 (80%) in each subject to qualify for it.</p>
                        </div>
                    </div>
                    <div className="ta-rule">
                        <span className="ta-rule-icon">3.</span>
                        <div>
                            <strong>Leadership review</strong>
                            <p>Your application is reviewed by our team with faculty advisor sign-off. Usually 2–3 school days.</p>
                        </div>
                    </div>
                </div>
                <div className="ta-intro-actions">
                    <button className="ta-start-btn" onClick={() => setPhase('info')}>Start Application</button>
                    <button className="ta-back-btn" onClick={() => navigate('/dashboard')}>Maybe later</button>
                </div>
            </div>
        </div>
    );

    // ─── INFO FORM ───
    if (phase === 'info') return (
        <div className="ta-page">
            <div className="ta-info-card">
                <div className="ta-step-indicator">
                    <span className="ta-step active">1 Info</span>
                    <span className="ta-step-line" />
                    <span className="ta-step">2 Quiz</span>
                    <span className="ta-step-line" />
                    <span className="ta-step">3 Review</span>
                </div>

                <h2 className="ta-info-title">Tell us about yourself</h2>
                <form onSubmit={handleInfoSubmit} noValidate>
                    <div className="ta-info-row">
                        <div className="ta-info-field">
                            <label>Full Name</label>
                            <input name="name" value={info.name} onChange={handleInfoChange} placeholder="Your full name" />
                        </div>
                        <div className="ta-info-field">
                            <label>Grade</label>
                            <select name="grade" value={info.grade} onChange={handleInfoChange}>
                                <option value="">Select…</option>
                                {GRADES.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="ta-info-field">
                        <label>
                            Subjects you can teach <span className="ta-required">(select all that apply)</span>
                        </label>
                        <p className="ta-info-hint" style={{ margin: '0 0 10px' }}>
                            You'll be quizzed on each subject you select — 5 questions, 80% required per subject.
                        </p>
                        <div className="ta-subjects-grid">
                            {TEACHABLE_SUBJECTS.map(s => {
                                const isSelected = info.subjects.includes(s);
                                const color = SUBJECT_COLORS[s];
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`ta-subject-chip ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSubjectToggle(s)}
                                        style={isSelected ? {
                                            background: color + '18',
                                            borderColor: color,
                                            color: color,
                                        } : {}}
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                        {info.subjects.length > 0 && (
                            <p className="ta-char-count" style={{ marginTop: '8px' }}>
                                {info.subjects.length * 5} questions total ({info.subjects.length} subject{info.subjects.length !== 1 ? 's' : ''} × 5)
                            </p>
                        )}
                    </div>

                    <div className="ta-info-field">
                        <label>
                            Why do you want to be a tutor? <span className="ta-required">(min 50 characters)</span>
                        </label>
                        <textarea
                            name="reason"
                            value={info.reason}
                            onChange={handleInfoChange}
                            rows={4}
                            placeholder="Describe why you want to help peers and what strengths you bring…"
                        />
                        <span className="ta-char-count">{info.reason.length} / 50 min</span>
                    </div>

                    <div className="ta-info-section-label">Teacher Reference</div>
                    <p className="ta-info-hint">Provide a math teacher who can vouch for your knowledge in the subject(s) above.</p>
                    <div className="ta-info-row">
                        <div className="ta-info-field">
                            <label>Teacher's Name</label>
                            <input name="teacherName" value={info.teacherName} onChange={handleInfoChange} placeholder="e.g. Ms. Johnson" />
                        </div>
                        <div className="ta-info-field">
                            <label>Their Subject / Class</label>
                            <input name="teacherSubject" value={info.teacherSubject} onChange={handleInfoChange} placeholder="e.g. AP Calculus AB" />
                        </div>
                    </div>

                    {infoError && <div className="ta-info-error">{infoError}</div>}

                    <div className="ta-info-actions">
                        <button type="button" className="ta-back-btn" onClick={() => setPhase('intro')}>← Back</button>
                        <button type="submit" className="ta-start-btn">Continue to Skills Quiz →</button>
                    </div>
                </form>
            </div>
        </div>
    );

    // ─── QUIZ ───
    if (phase === 'quiz') return (
        <div className="ta-page">
            <div className="ta-test-header">
                <button className="ta-back-link" onClick={() => setPhase('info')}>← Back to form</button>
                <span className="ta-progress-text">{answered} / {quizQuestions.length} answered</span>
                <div className="ta-progress-bar">
                    <div className="ta-progress-fill" style={{ width: `${quizQuestions.length > 0 ? (answered / quizQuestions.length) * 100 : 0}%` }} />
                </div>
            </div>

            <div className="ta-quiz-banner">
                <span>Step 2 of 3 — Subject Skills Quiz</span>
                <span>Need 4/5 (80%) in each subject to qualify</span>
            </div>

            <div className="ta-questions">
                {info.subjects.map(subj => {
                    const subjQs = quizQuestions
                        .map((q, i) => ({ ...q, globalIdx: i }))
                        .filter(q => q.subject === subj);
                    const answeredInSubj = subjQs.filter(q => answers[q.globalIdx] !== undefined).length;
                    const color = SUBJECT_COLORS[subj] || '#3b82f6';
                    return (
                        <div key={subj} className="ta-subject-section">
                            <div className="ta-subject-section-header" style={{ borderLeftColor: color }}>
                                <span className="ta-subj-name" style={{ color }}>{subj}</span>
                                <span className="ta-subj-progress">{answeredInSubj}/{subjQs.length} answered</span>
                            </div>
                            {subjQs.map(q => (
                                <div key={q.globalIdx} className="ta-question-card">
                                    <div className="ta-q-header">
                                        <span className="ta-q-subject" style={{ background: color + '18', color }}>
                                            {subj}
                                        </span>
                                        <span className="ta-q-num">Q{q.globalIdx + 1}</span>
                                    </div>
                                    <p className="ta-q-text">{q.q}</p>
                                    <div className="ta-options">
                                        {q.options.map((opt, j) => (
                                            <button
                                                key={j}
                                                className={`ta-option ${answers[q.globalIdx] === j ? 'selected' : ''}`}
                                                onClick={() => handleSelect(q.globalIdx, j)}
                                            >
                                                <span className="ta-option-letter">{String.fromCharCode(65 + j)}</span>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className="ta-submit-bar">
                <span className="ta-submit-status">
                    {allAnswered
                        ? 'All questions answered — ready to submit!'
                        : `${quizQuestions.length - answered} question${quizQuestions.length - answered !== 1 ? 's' : ''} remaining`}
                </span>
                <button className="ta-submit-btn" onClick={handleQuizSubmit} disabled={!allAnswered}>
                    Submit Quiz
                </button>
            </div>
        </div>
    );

    // ─── RESULT ───
    const failedSubjects = info.subjects.filter(s => !passedSubjects.includes(s));
    const allPassed = passedSubjects.length === info.subjects.length;
    const nonePassed = passedSubjects.length === 0;

    return (
        <div className="ta-page">
            <div className="ta-result-card">
                <div className="ta-result-icon">
                    {allPassed ? '★' : nonePassed ? '—' : '+'}
                </div>
                <h1 className="ta-result-title">
                    {allPassed ? 'Application Submitted!' : nonePassed ? 'Quiz Not Passed' : 'Partial Qualification'}
                </h1>

                {!nonePassed && (
                    <p className="ta-result-desc">
                        {allPassed
                            ? `Great work, ${info.name}! Your application for all ${passedSubjects.length} subject${passedSubjects.length !== 1 ? 's' : ''} is under review. Expect a response within 2–3 school days.`
                            : `You qualified for ${passedSubjects.join(', ')}. Your application has been submitted for those subjects. Study ${failedSubjects.join(', ')} and reapply to add them later.`}
                    </p>
                )}
                {nonePassed && (
                    <p className="ta-result-desc">
                        You need at least 4/5 (80%) in each subject to qualify. Review your notes and try again — your application info is saved.
                    </p>
                )}

                <div className="ta-breakdown">
                    {info.subjects.map(subj => {
                        const s = subjectScores[subj] || { correct: 0, total: 5 };
                        const isPassed = passedSubjects.includes(subj);
                        const color = SUBJECT_COLORS[subj] || '#3b82f6';
                        return (
                            <div key={subj} className="ta-breakdown-row">
                                <span className="ta-bd-subject" style={{ color }}>{subj}</span>
                                <div className="ta-bd-bar-wrap">
                                    <div
                                        className="ta-bd-bar"
                                        style={{
                                            width: `${(s.correct / s.total) * 100}%`,
                                            background: isPassed ? '#10b981' : '#ef4444',
                                        }}
                                    />
                                </div>
                                <span className="ta-bd-score">{s.correct}/{s.total}</span>
                                <span className={`ta-bd-badge ${isPassed ? 'pass' : 'fail'}`}>
                                    {isPassed ? 'PASS' : 'FAIL'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="ta-result-actions">
                    {!nonePassed ? (
                        <>
                            <Link to="/apply/status" className="ta-start-btn" style={{ textDecoration: 'none' }}>
                                Check Application Status
                            </Link>
                            <button className="ta-back-btn" onClick={() => navigate('/dashboard')}>
                                Return to Dashboard
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="ta-start-btn" onClick={() => { setAnswers({}); setPhase('quiz'); }}>
                                Retake Quiz
                            </button>
                            <button className="ta-back-btn" onClick={() => navigate('/resources')}>
                                Study First
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TutorApplication;
