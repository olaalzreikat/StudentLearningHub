// Dashboard page — shows the user's progress overview, quick actions, and upcoming schedule
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress, saveProgress, getAgendaKey, getDailyTasksKey, getQuizScoresKey, loadProgressFromFirestore } from '../utils/localStorage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { subjects } from '../utils/subjectColors';
import { videosData, quizzesData, problemsData, lessonsData, guidesData } from '../data/resourcesData';
import ProgressCharts from '../components/ProgressCharts';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Core state — progress loaded from localStorage, loading flag, and show more toggles
    const [progress, setProgress] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllCourses, setShowAllCourses] = useState(false);
    const [showAllLessons, setShowAllLessons] = useState(false);

    // Modal visibility states
    const [showAgendaModal, setShowAgendaModal] = useState(false);
    const [showGoalsModal, setShowGoalsModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Agenda and daily task data
    const [agendaItems, setAgendaItems] = useState([]);
    const [dailyTasks, setDailyTasks] = useState([]);
    const [newAgendaItem, setNewAgendaItem] = useState({ 
        title: '', 
        subject: '', 
        date: '', 
        time: '' 
    });
    const [newTask, setNewTask] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [myBookings, setMyBookings] = useState([]);
    const [preCompose, setPreCompose] = useState(null);
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewStars, setReviewStars] = useState(0);
    const [reviewComment, setReviewComment] = useState('');

    useEffect(() => {
        try {
            const userProgress = getProgress();
            
            // Clean up any corrupted activity data
            if (userProgress.recentActivity) {
                userProgress.recentActivity = userProgress.recentActivity.filter(activity => 
                    activity && 
                    activity.type && 
                    activity.title && 
                    typeof activity.type === 'string' &&
                    typeof activity.title === 'string'
                );
            }
            
            console.log('Loaded progress:', userProgress);
            setProgress(userProgress);
            
            // Load agenda items from localStorage or set default
            const savedAgenda = localStorage.getItem(getAgendaKey());
            if (savedAgenda) {
                setAgendaItems(JSON.parse(savedAgenda));
            }

            // Load daily tasks from localStorage
            const savedTasks = localStorage.getItem(getDailyTasksKey());
            const today = new Date().toDateString();
            if (savedTasks) {
                const tasksData = JSON.parse(savedTasks);
                // Reset tasks if it's a new day
                if (tasksData.date !== today) {
                    const resetTasks = tasksData.tasks.map(task => ({ ...task, completed: false }));
                    const newTasksData = { date: today, tasks: resetTasks };
                    localStorage.setItem(getDailyTasksKey(), JSON.stringify(newTasksData));
                    setDailyTasks(resetTasks);
                } else {
                    setDailyTasks(tasksData.tasks);
                }
            } else {
                // Set default daily tasks
                const defaultTasks = [
                    { id: 1, text: 'Complete 1 lesson', completed: false },
                    { id: 2, text: 'Watch 1 video', completed: false },
                    { id: 3, text: 'Take 1 quiz', completed: false }
                ];
                const tasksData = { date: today, tasks: defaultTasks };
                localStorage.setItem(getDailyTasksKey(), JSON.stringify(tasksData));
                setDailyTasks(defaultTasks);
            }
            // Load accepted 1-on-1 bookings for this student
            const savedRequests = localStorage.getItem('oneOnOneRequests');
            if (savedRequests && user?.uid) {
                const allReqs = JSON.parse(savedRequests);
                setMyBookings(allReqs.filter(r => r.studentId === user.uid && ['accepted', 'cancelled', 'cancelled_by_student'].includes(r.status)));
            }

        } catch (error) {
            console.error('Error loading progress:', error);
            setProgress({
                completedVideos: [],
                completedLessons: [],
                completedQuizzes: [],
                completedProblems: [],
                completedGuides: [],
                recentActivity: [],
                achievements: []
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh progress when the tab regains focus (user completes resource in new tab and switches back)
    useEffect(() => {
        const reload = () => {
            const fresh = getProgress();
            if (fresh) setProgress(fresh);
        };
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') reload();
        });
        window.addEventListener('focus', reload);
        return () => {
            document.removeEventListener('visibilitychange', reload);
            window.removeEventListener('focus', reload);
        };
    }, []);

    // Firestore cross-device sync — runs after local load
    useEffect(() => {
        if (!user?.uid) return;
        loadProgressFromFirestore(user.uid).then(firestoreProgress => {
            if (!firestoreProgress) return;
            setProgress(local => {
                const merged = {
                    ...local,
                    ...firestoreProgress,
                    completedVideos:    [...new Set([...(local?.completedVideos    || []), ...(firestoreProgress.completedVideos    || [])])],
                    completedLessons:   [...new Set([...(local?.completedLessons   || []), ...(firestoreProgress.completedLessons   || [])])],
                    completedQuizzes:   [...new Set([...(local?.completedQuizzes   || []), ...(firestoreProgress.completedQuizzes   || [])])],
                    completedProblems:  [...new Set([...(local?.completedProblems  || []), ...(firestoreProgress.completedProblems  || [])])],
                    completedGuides:    [...new Set([...(local?.completedGuides    || []), ...(firestoreProgress.completedGuides    || [])])],
                    completedActivities: Math.max(local?.completedActivities || 0, firestoreProgress.completedActivities || 0),
                    streak: Math.max(local?.streak || 0, firestoreProgress.streak || 0),
                    lastActivity: [local?.lastActivity, firestoreProgress.lastActivity]
                        .filter(Boolean)
                        .sort()
                        .pop() || null,
                    achievements: Object.values(
                        [...(local?.achievements || []), ...(firestoreProgress.achievements || [])]
                            .reduce((acc, a) => { acc[a.name] = a; return acc; }, {})
                    ),
                    recentActivity: [...(local?.recentActivity || []), ...(firestoreProgress.recentActivity || [])]
                        .filter((a, i, arr) => a && a.title && arr.findIndex(b => b?.title === a.title && b?.timestamp === a.timestamp) === i)
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 20),
                };
                saveProgress(merged);
                return merged;
            });
        });

        // Also load agenda items from Firestore
        getDoc(doc(db, 'users', user.uid)).then(snap => {
            if (!snap.exists()) return;
            const data = snap.data();
            if (data.agendaItems?.length) {
                setAgendaItems(prev => {
                    const merged = [...prev];
                    data.agendaItems.forEach(item => {
                        if (!merged.find(x => x.title === item.title && x.date === item.date && x.time === item.time)) {
                            merged.push(item);
                        }
                    });
                    const sorted = merged.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
                    localStorage.setItem(getAgendaKey(), JSON.stringify(sorted));
                    return sorted;
                });
            }
        }).catch(() => {});
    }, [user?.uid]);

    const showNotificationMessage = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const toggleTask = (taskId) => {
        const updatedTasks = dailyTasks.map(task => {
            if (task.id === taskId) {
                const newCompleted = !task.completed;
                // Show notification when task is completed
                if (newCompleted) {
                    showNotificationMessage(`Great job! Task completed: "${task.text}"`);
                }
                return { ...task, completed: newCompleted };
            }
            return task;
        });
        
        setDailyTasks(updatedTasks);
        const today = new Date().toDateString();
        localStorage.setItem(getDailyTasksKey(), JSON.stringify({ date: today, tasks: updatedTasks }));
    };

    const addCustomTask = () => {
        if (newTask.trim()) {
            const customTask = {
                id: Date.now(),
                text: newTask,
                completed: false,
                custom: true
            };
            const updatedTasks = [...dailyTasks, customTask];
            setDailyTasks(updatedTasks);
            const today = new Date().toDateString();
            localStorage.setItem(getDailyTasksKey(), JSON.stringify({ date: today, tasks: updatedTasks }));
            setNewTask('');
            setShowTaskModal(false);
            showNotificationMessage('New task added to your daily goals!');
        }
    };

    const removeTask = (taskId) => {
        const updatedTasks = dailyTasks.filter(task => task.id !== taskId);
        setDailyTasks(updatedTasks);
        const today = new Date().toDateString();
        localStorage.setItem(getDailyTasksKey(), JSON.stringify({ date: today, tasks: updatedTasks }));
    };

    // Capitalize the first letter of a string safely
    const capitalizeFirst = (str) => {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const getCurrentDate = () => {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    // Returns a time based greeting (morning / afternoon / evening)
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning!';
        if (hour < 17) return 'Good afternoon!';
        return 'Good evening!';
    };

    const formatSessionDate = (dateStr, timeStr) => {
        const date = new Date(`${dateStr}T${timeStr}`);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Reset time portion for comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        const sessionDate = new Date(date);
        sessionDate.setHours(0, 0, 0, 0);
        
        if (sessionDate.getTime() === today.getTime()) {
            return `Today at ${formatTime(timeStr)}`;
        } else if (sessionDate.getTime() === tomorrow.getTime()) {
            return `Tomorrow at ${formatTime(timeStr)}`;
        } else {
            const options = { month: 'short', day: 'numeric' };
            return `${date.toLocaleDateString('en-US', options)} at ${formatTime(timeStr)}`;
        }
    };

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isSessionUpcoming = (dateStr, timeStr) => {
        const sessionDateTime = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        return sessionDateTime >= now;
    };

    const handleAddAgendaItem = () => {
        if (newAgendaItem.title && newAgendaItem.subject && newAgendaItem.date && newAgendaItem.time) {
            const updatedAgenda = [...agendaItems, newAgendaItem].sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            });
            setAgendaItems(updatedAgenda);
            localStorage.setItem(getAgendaKey(), JSON.stringify(updatedAgenda));
            if (user?.uid) setDoc(doc(db, 'users', user.uid), { agendaItems: updatedAgenda }, { merge: true }).catch(() => {});
            setNewAgendaItem({ title: '', subject: '', date: '', time: '' });
            setShowAgendaModal(false);
            showNotificationMessage('Session scheduled successfully!');
        }
    };

    const handleCancelBooking = (bookingId) => {
        const saved = localStorage.getItem('oneOnOneRequests');
        const all = saved ? JSON.parse(saved) : [];
        const updated = all.map(r => r.id === bookingId ? { ...r, status: 'cancelled_by_student' } : r);
        localStorage.setItem('oneOnOneRequests', JSON.stringify(updated));
        setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled_by_student' } : b));
        showNotificationMessage('Session cancelled.');
    };

    const handleDeleteBooking = (bookingId) => {
        const saved = localStorage.getItem('oneOnOneRequests');
        const all = saved ? JSON.parse(saved) : [];
        localStorage.setItem('oneOnOneRequests', JSON.stringify(all.filter(r => r.id !== bookingId)));
        setMyBookings(prev => prev.filter(b => b.id !== bookingId));
    };

    const hasReviewed = (booking) => {
        const ratings = JSON.parse(localStorage.getItem('tutorRatings') || '{}');
        const tutorRatings = ratings[booking.tutorId] || [];
        return tutorRatings.some(r => r.bookingId === booking.id);
    };

    const submitReview = () => {
        if (!reviewModal || reviewStars === 0) return;
        const ratings = JSON.parse(localStorage.getItem('tutorRatings') || '{}');
        const key = reviewModal.tutorId;
        if (!ratings[key]) ratings[key] = [];
        ratings[key].push({
            bookingId: reviewModal.id,
            studentEmail: user?.email || '',
            rating: reviewStars,
            comment: reviewComment.trim(),
            date: new Date().toISOString(),
        });
        localStorage.setItem('tutorRatings', JSON.stringify(ratings));
        setReviewModal(null);
        setReviewStars(0);
        setReviewComment('');
        showNotificationMessage('Review submitted! Thank you.');
    };

    function downloadProgressReport() {
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Bar chart data
        const chartData = [
            { label: 'Lessons',  value: completedLessons },
            { label: 'Videos',   value: completedVideos },
            { label: 'Quizzes',  value: completedQuizzes },
        ];
        const chartMax = Math.max(...chartData.map(d => d.value), 1);
        const BAR_W = 260;
        const ROW_H = 36;
        const LABEL_W = 70;
        const svgH = chartData.length * ROW_H + 16;
        const chartSVG = `
<svg width="${LABEL_W + BAR_W + 60}" height="${svgH}" xmlns="http://www.w3.org/2000/svg" style="display:block">
  ${chartData.map((d, i) => {
      const y = i * ROW_H + 8;
      const barPx = Math.round((d.value / chartMax) * BAR_W);
      return `
  <text x="${LABEL_W - 8}" y="${y + 14}" text-anchor="end" font-family="Arial,sans-serif" font-size="11" fill="#475569" font-weight="600">${d.label}</text>
  <rect x="${LABEL_W}" y="${y}" width="${BAR_W}" height="20" rx="4" fill="#f1f5f9"/>
  <rect x="${LABEL_W}" y="${y}" width="${barPx}" height="20" rx="4" fill="#1e3a8a"/>
  <text x="${LABEL_W + barPx + 6}" y="${y + 14}" font-family="Arial,sans-serif" font-size="11" fill="#1e3a8a" font-weight="700">${d.value}</text>`;
  }).join('')}
</svg>`;

        const activityRows = (progress.recentActivity || []).slice(0, 20).map((a, i) => `
          <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
            <td><span class="type-badge">${a.type}</span></td>
            <td>${a.title}</td>
            <td>${a.topic || '—'}</td>
            <td>${a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
          </tr>`).join('');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Equalizer Learning Hub — Progress Report</title>
<style>
  @page { size: letter; margin: 2cm 2.2cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #111827;
    background: white;
    font-size: 12.5px;
    line-height: 1.55;
  }

  /* ── Header ── */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 14px;
    border-bottom: 2px solid #111827;
    margin-bottom: 24px;
  }
  .brand-name {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
  }
  .brand-sub {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }
  .header-meta {
    text-align: right;
    font-size: 11.5px;
    color: #374151;
    line-height: 1.7;
  }
  .header-meta .meta-name {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
  }

  /* ── Section ── */
  .section { margin-bottom: 22px; page-break-inside: avoid; }
  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: #6b7280;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #d1d5db;
  }

  /* ── Two-column layout for stats + chart ── */
  .overview-cols {
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: 20px;
    align-items: start;
  }

  /* ── Stat grid ── */
  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .stat-card {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 10px 12px;
    text-align: center;
    background: #f9fafb;
  }
  .stat-num {
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
    margin-bottom: 3px;
  }
  .stat-lbl {
    font-size: 9.5px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    font-weight: 600;
  }

  /* ── Chart ── */
  .chart-wrap { padding-top: 4px; }
  .chart-title {
    font-size: 10px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  /* ── Activity table ── */
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f3f4f6; }
  th {
    padding: 8px 10px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: #6b7280;
    border-bottom: 1px solid #d1d5db;
  }
  td {
    padding: 8px 10px;
    color: #1f2937;
    border-bottom: 1px solid #f3f4f6;
    font-size: 12px;
  }
  .row-odd td { background: #f9fafb; }
  .type-badge {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 20px;
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border: 1px solid #d1d5db;
    color: #374151;
    background: white;
  }

  /* ── Footer ── */
  .report-footer {
    margin-top: 28px;
    padding-top: 10px;
    border-top: 1px solid #d1d5db;
    display: flex;
    justify-content: space-between;
    font-size: 10.5px;
    color: #9ca3af;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="report-header">
  <div>
    <div class="brand-name">Equalizer Learning Hub</div>
    <div class="brand-sub">Student Progress Report</div>
  </div>
  <div class="header-meta">
    <div class="meta-name">${user?.displayName || user?.email?.split('@')[0] || 'Student'}</div>
    <div>${user?.email || ''}</div>
    <div>${date}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Overview</div>
  <div class="overview-cols">
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num">${completedResources}</div><div class="stat-lbl">Completed</div></div>
      <div class="stat-card"><div class="stat-num">${overallProgress}%</div><div class="stat-lbl">Progress</div></div>
      <div class="stat-card"><div class="stat-num">${progress.streak || 0}</div><div class="stat-lbl">Day Streak</div></div>
      <div class="stat-card"><div class="stat-num">${completedLessons + completedVideos + completedQuizzes}</div><div class="stat-lbl">Activities</div></div>
    </div>
    <div class="chart-wrap">
      <div class="chart-title">Completion by Type</div>
      ${chartSVG}
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Recent Activity</div>
  <table>
    <thead>
      <tr><th>Type</th><th>Title</th><th>Topic</th><th>Date</th></tr>
    </thead>
    <tbody>
      ${activityRows || '<tr><td colspan="4" style="color:#9ca3af;text-align:center;padding:18px">No activity recorded yet</td></tr>'}
    </tbody>
  </table>
</div>

<div class="report-footer">
  <span>Equalizer Learning Hub &middot; Confidential</span>
  <span>Generated ${date}</span>
</div>

<script>window.onload = () => window.print();<\/script>
</body>
</html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    }

    const handleRemoveAgendaItem = (index) => {
        const removedItem = agendaItems[index];
        const updatedAgenda = agendaItems.filter((_, i) => i !== index);
        setAgendaItems(updatedAgenda);
        localStorage.setItem(getAgendaKey(), JSON.stringify(updatedAgenda));
        
        // If it's a group session, decrease the count
        if (removedItem.type === 'group' && removedItem.groupId) {
            const savedCounts = localStorage.getItem('groupSessionCounts');
            if (savedCounts) {
                const sessionCounts = JSON.parse(savedCounts);
                const currentCount = sessionCounts[removedItem.groupId] || 0;
                sessionCounts[removedItem.groupId] = Math.max(0, currentCount - 1);
                localStorage.setItem('groupSessionCounts', JSON.stringify(sessionCounts));
            }
            showNotificationMessage(`Cancelled group session: ${removedItem.title}`);
        } else {
            showNotificationMessage('Session removed from schedule');
        }
    };

    // Quick action buttons — all route to the resources page
    const quickActions = [
        { label: 'Watch Video', action: () => navigate('/resources'), tint: '#eff6ff', accent: '#1e40af' },
        { label: 'Start Lesson', action: () => navigate('/resources'), tint: '#eff6ff', accent: '#1e40af' },
        { label: 'Take Quiz', action: () => navigate('/resources'), tint: '#eff6ff', accent: '#1e40af' },
        { label: 'Practice', action: () => navigate('/resources'), tint: '#eff6ff', accent: '#1e40af' }
    ];

    // Build achievements list dynamically based on what the user has completed
    const achievements = [];
    
    const completedVideos = progress?.completedVideos?.length || 0;
    const completedLessons = progress?.completedLessons?.length || 0;
    const completedQuizzes = progress?.completedQuizzes?.length || 0;
    
    // Check for perfect quiz score
    const quizScores = JSON.parse(localStorage.getItem(getQuizScoresKey()) || '{}');
    const hasPerfectScore = Object.values(quizScores).some(score => score === 100);


    if (isLoading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <h2>Loading your dashboard...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-container">
                    <div className="error-state">
                        <h2>Error Loading Dashboard</h2>
                        <p>Please refresh the page to try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate total completion stats
    const totalVideos = videosData.length;
    const totalLessons = lessonsData.length;
    const totalQuizzes = quizzesData.length;
    const totalProblems = problemsData.length;
    const totalGuides = guidesData.length;

    const completedProblems = progress.completedProblems?.length || 0;
    const completedGuides = progress.completedGuides?.length || 0;

    const totalResources = totalVideos + totalLessons + totalQuizzes + totalProblems + totalGuides;
    const completedResources = completedVideos + completedLessons + completedQuizzes + completedProblems + completedGuides;

    // Calculate subject progress

    const getSubjectProgress = (subject) => {
        const subjectVideos = videosData.filter(v => v.topic === subject);
        const subjectLessons = lessonsData.filter(l => l.topic === subject);
        const subjectQuizzes = quizzesData.filter(q => q.topic === subject);
        const subjectProblems = problemsData.filter(p => p.topic === subject);

        const totalSubjectItems = subjectVideos.length + subjectLessons.length + subjectQuizzes.length + subjectProblems.length;

        const completedSubjectVideos = subjectVideos.filter(v => progress.completedVideos?.includes(v.id)).length;
        const completedSubjectLessons = subjectLessons.filter(l => progress.completedLessons?.includes(l.id)).length;
        const completedSubjectQuizzes = subjectQuizzes.filter(q => progress.completedQuizzes?.includes(q.id)).length;
        const completedSubjectProblems = subjectProblems.filter(p => progress.completedProblems?.includes(p.id)).length;

        const completedSubjectItems = completedSubjectVideos + completedSubjectLessons + completedSubjectQuizzes + completedSubjectProblems;

        return totalSubjectItems > 0 ? Math.round((completedSubjectItems / totalSubjectItems) * 100) : 0;
    };

    // Overall progress = average of all subject progresses (matches course cards)
    const overallProgress = Math.round(
        subjects.reduce((sum, s) => sum + getSubjectProgress(s.name.toLowerCase()), 0) / subjects.length
    );

    const getSubjectCounts = (subject) => {
        const subjectVideos = videosData.filter(v => v.topic === subject);
        const subjectLessons = lessonsData.filter(l => l.topic === subject);
        const subjectQuizzes = quizzesData.filter(q => q.topic === subject);
        const subjectProblems = problemsData.filter(p => p.topic === subject);
        const total = subjectVideos.length + subjectLessons.length + subjectQuizzes.length + subjectProblems.length;
        const completed = subjectVideos.filter(v => progress.completedVideos?.includes(v.id)).length
            + subjectLessons.filter(l => progress.completedLessons?.includes(l.id)).length
            + subjectQuizzes.filter(q => progress.completedQuizzes?.includes(q.id)).length
            + subjectProblems.filter(p => progress.completedProblems?.includes(p.id)).length;
        return { completed, total };
    };

    const coursesToDisplay = showAllCourses ? subjects : subjects.slice(0, 3);
    const lessonsToDisplay = showAllLessons ? progress.recentActivity : progress.recentActivity?.slice(0, 6);

    // Calculate daily task completion
    const completedTasksCount = dailyTasks.filter(task => task.completed).length;
    const totalTasksCount = dailyTasks.length;
    const taskCompletionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return (
        <div className="dashboard-page">
                {/* Fixed notification */}
                <div role="status" aria-live="polite" aria-atomic="true">
                    {showNotification && <div className="notification">{notificationMessage}</div>}
                </div>

                {/* Hero */}
                <div className="dashboard-hero">
                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="dash-eyebrow">
                                Student Dashboard
                            </div>
                            <h1>{getGreeting()}</h1>
                            <p>{getCurrentDate()}</p>
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="dash-stats-bar">
                    <div className="sched-stat">
                        <span className="sched-stat-num">{completedTasksCount}/{totalTasksCount}</span>
                        <span className="sched-stat-label">Tasks Today</span>
                    </div>
                    <div className="sched-stat-div" />
                    <div className="sched-stat">
                        <span className="sched-stat-num">{completedResources}</span>
                        <span className="sched-stat-label">Completed</span>
                    </div>
                    <div className="sched-stat-div" />
                    <div className="sched-stat">
                        <span className="sched-stat-num">{overallProgress}%</span>
                        <span className="sched-stat-label">Overall Progress</span>
                    </div>
                    <div className="sched-stat-div" />
                    <div className="sched-stat">
                        <span className="sched-stat-num">{progress.streak || 0}</span>
                        <span className="sched-stat-label">Day Streak</span>
                    </div>
                </div>

            <div className="dashboard-container">
                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <button key={index} className="quick-action-card" onClick={action.action} style={{ borderLeftColor: action.accent }}>
                                <span className="action-label" style={{ color: action.accent }}>{action.label}</span>
                                <span className="action-arrow" style={{ color: action.accent }}>→</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* Left Column */}
                    <div className="left-column">
                        {/* Daily Tasks Card */}
                        <div className="section daily-tasks-card">
                            <div className="section-header">
                                <h2>Today's Tasks</h2>
                                <button className="icon-btn" onClick={() => setShowTaskModal(true)} aria-label="Add new task">+</button>
                            </div>
                            <div className="task-progress-header">
                                <div className="task-progress-row">
                                    <span className="task-progress-text">{completedTasksCount} of {totalTasksCount} completed</span>
                                    <span className="task-progress-pct">{taskCompletionPercentage}%</span>
                                </div>
                                <div className="task-progress-bar">
                                    <div
                                        className="task-progress-fill"
                                        style={{ width: `${taskCompletionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="tasks-list">
                                {dailyTasks.map((task) => (
                                    <div key={task.id} className="task-item">
                                        <input
                                            type="checkbox"
                                            id={`task-${task.id}`}
                                            checked={task.completed}
                                            onChange={() => toggleTask(task.id)}
                                            className="task-checkbox"
                                        />
                                        <label htmlFor={`task-${task.id}`} className={`task-text ${task.completed ? 'completed' : ''}`}>
                                            {task.text}
                                        </label>
                                        {task.custom && (
                                            <button
                                                className="remove-task-btn"
                                                onClick={() => removeTask(task.id)}
                                                aria-label={`Remove task: ${task.text}`}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Your Courses */}
                        <div className="section">
                            <div className="section-header">
                                <h2>Your Courses</h2>
                                <button 
                                    className="more-btn"
                                    onClick={() => setShowAllCourses(!showAllCourses)}
                                >
                                    {showAllCourses ? 'Less' : 'More'}
                                </button>
                            </div>
                            <div className="courses-grid">
                                {coursesToDisplay.map((subject) => {
                                    const subjectProgress = getSubjectProgress(subject.name.toLowerCase());
                                    const { completed, total } = getSubjectCounts(subject.name.toLowerCase());
                                    return (
                                        <div
                                            key={subject.name}
                                            className="course-card"
                                            onClick={() => navigate('/resources')}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`${subject.name}: ${getSubjectProgress(subject.name.toLowerCase())}% complete`}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/resources'); }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="course-icon" style={{ background: subject.color }}>
                                                <span>{subject.icon}</span>
                                            </div>
                                            <div className="course-info">
                                                <h3>{subject.name}</h3>
                                                <p>{completed} of {total} done</p>
                                            </div>
                                            <div className="course-progress-bar">
                                                <div 
                                                    className="course-progress-fill" 
                                                    style={{ 
                                                        width: `${subjectProgress}%`,
                                                        background: subject.color 
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="course-percentage">{subjectProgress}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                        {/* Badges & Achievements */}
                        {(progress.achievements?.length > 0 || completedVideos > 0 || completedQuizzes > 0 || completedLessons > 0 || (progress.streak || 0) >= 3) && (
                        <div className="badges-card">
                            <div className="badges-header">
                                <h3>Badges & Achievements</h3>
                                <span className="badges-count">{(progress.achievements?.length || 0) + (completedVideos > 0 ? 1 : 0) + ((progress.streak||0)>=3 ? 1:0) + (completedQuizzes>0?1:0) + (completedLessons>0?1:0)}</span>
                            </div>
                            <div className="badges-grid">
                                {completedVideos > 0 && (
                                    <div className="badge-item earned">
                                        <span className="badge-icon">V</span>
                                        <span className="badge-name">Video Watcher</span>
                                        <span className="badge-sub">{completedVideos} video{completedVideos !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                {completedLessons > 0 && (
                                    <div className="badge-item earned">
                                        <span className="badge-icon">L</span>
                                        <span className="badge-name">Lesson Learner</span>
                                        <span className="badge-sub">{completedLessons} lesson{completedLessons !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                {completedQuizzes > 0 && (
                                    <div className="badge-item earned">
                                        <span className="badge-icon">Q</span>
                                        <span className="badge-name">Quiz Taker</span>
                                        <span className="badge-sub">{completedQuizzes} quiz{completedQuizzes !== 1 ? 'zes' : ''}</span>
                                    </div>
                                )}
                                {(progress.streak || 0) >= 3 && (
                                    <div className="badge-item earned streak">
                                        <span className="badge-icon">S</span>
                                        <span className="badge-name">On a Streak</span>
                                        <span className="badge-sub">{progress.streak} days</span>
                                    </div>
                                )}
                                {(progress.achievements || []).filter(a => !['First Steps','Video Enthusiast','Quiz Master','Knowledge Seeker'].includes(a.name)).map((a, i) => (
                                    <div key={i} className="badge-item earned">
                                        <span className="badge-icon">★</span>
                                        <span className="badge-name">{a.name}</span>
                                        <span className="badge-sub">{a.description}</span>
                                    </div>
                                ))}
                                {completedResources === 0 && (
                                    <div className="badge-item locked">
                                        <span className="badge-icon locked-icon">?</span>
                                        <span className="badge-name">First Steps</span>
                                        <span className="badge-sub">Complete your first activity</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}


                                {/* Become a Tutor CTA */}
                        <div className="become-tutor-card" onClick={() => navigate('/apply')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate('/apply')}>
                            <div className="bt-icon">+</div>
                            <div className="bt-text">
                                <strong>Become a Student Tutor</strong>
                                <p>Think you know the material? Take the qualification test and help your peers.</p>
                            </div>
                            <span className="bt-arrow">→</span>
                        </div>

                        {/* My Bookings — accepted 1-on-1 sessions */}
                        {myBookings.length > 0 && (
                            <div className="my-bookings-card">
                                <div className="bookings-header">
                                    <h3>My 1-on-1 Sessions</h3>
                                    <span className="bookings-count">{myBookings.length}</span>
                                </div>
                                <div className="bookings-list">
                                    {myBookings.map(booking => {
                                        const subj = subjects.find(s => s.name.toLowerCase() === booking.subject.toLowerCase()) || subjects[0];
                                        const [h, m] = booking.preferredTime.split(':');
                                        const hr = parseInt(h);
                                        const timeStr = `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                                        const dateStr = new Date(booking.preferredDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        const isCancelled = booking.status === 'cancelled' || booking.status === 'cancelled_by_student';
                                        return (
                                            <div key={booking.id} className={`booking-item ${isCancelled ? 'booking-item-cancelled' : ''}`}>
                                                <div className="booking-icon" style={{ background: subj.color, opacity: isCancelled ? 0.45 : 1 }}>{subj.icon}</div>
                                                <div className="booking-details">
                                                    <div className="booking-top">
                                                        <span className="booking-tutor">with {booking.tutorName}</span>
                                                        <span className="booking-subject-tag">{booking.subject.charAt(0).toUpperCase() + booking.subject.slice(1)}</span>
                                                    </div>
                                                    <span className="booking-time">{dateStr} at {timeStr}</span>
                                                    {booking.status === 'cancelled' && (
                                                        <span className="booking-cancelled">Cancelled by tutor</span>
                                                    )}
                                                    {booking.status === 'cancelled_by_student' && (
                                                        <span className="booking-cancelled">You cancelled this session</span>
                                                    )}
                                                    {booking.status === 'accepted' && !booking.meetingLink && (
                                                        <span className="booking-no-link">Tutor will share a link soon</span>
                                                    )}
                                                </div>
                                                <div className="booking-actions">
                                                    {booking.status === 'accepted' && booking.meetingLink && (
                                                        <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="booking-join-btn">
                                                            Join →
                                                        </a>
                                                    )}
                                                    {booking.status === 'accepted' && (
                                                        <button
                                                            className="booking-chat-btn"
                                                            onClick={() => navigate('/messages', { state: { compose: { to: booking.tutorEmail, subject: `Re: Our tutoring session` } } })}
                                                        >
                                                            Message
                                                        </button>
                                                    )}
                                                    {booking.status === 'accepted' && (
                                                        <button className="booking-cancel-btn" onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                                                    )}
                                                    {booking.status === 'accepted' && !hasReviewed(booking) && (
                                                        <button className="booking-review-btn" onClick={() => { setReviewModal(booking); setReviewStars(0); setReviewComment(''); }}>
                                                            ★ Rate
                                                        </button>
                                                    )}
                                                    {booking.status === 'accepted' && hasReviewed(booking) && (
                                                        <span className="booking-reviewed-badge">Reviewed ✓</span>
                                                    )}
                                                    {(booking.status === 'cancelled' || booking.status === 'cancelled_by_student') && (
                                                        <button className="booking-delete-btn" onClick={() => handleDeleteBooking(booking.id)}>Remove</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Sessions */}
                        <div className="agenda-card">
                            <div className="agenda-header">
                                <h3>Upcoming Sessions</h3>
                                <button 
                                    className="add-btn"
                                    onClick={() => setShowAgendaModal(true)}
                                >
                                    Add
                                </button>
                            </div>
                            <div className="agenda-date">{getCurrentDate()}</div>
                            
                            <div className="agenda-list">
                                {agendaItems.length > 0 ? (
                                    agendaItems
                                        .filter(item => isSessionUpcoming(item.date, item.time))
                                        .slice(0, 5)
                                        .map((item, index) => {
                                            const subject = subjects.find(s => s.name.toLowerCase() === item.subject.toLowerCase()) || subjects[0];
                                            const isGroupSession = item.type === 'group';
                                            
                                            return (
                                                <div key={index} className="agenda-item">
                                                    <div className="agenda-icon" style={{ background: subject.color }}>
                                                        {subject.icon}
                                                    </div>
                                                    <div className="agenda-details">
                                                        <h4>
                                                            {item.title}
                                                        </h4>
                                                        <span className="agenda-time">{formatSessionDate(item.date, item.time)}</span>
                                                    </div>
                                                    <button
                                                        className="remove-agenda-btn"
                                                        onClick={() => handleRemoveAgendaItem(index)}
                                                        aria-label={`Remove session: ${item.title}`}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="no-sessions">
                                        <p>No upcoming sessions scheduled.</p>
                                        <p className="no-sessions-hint">Click "Add" to schedule a tutoring session or visit the <span style={{ color: '#1e40af', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/schedule')}>Schedule page</span> to join a group session!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Overall Progress */}
                        <div className="progress-overview-card">
                            <h3>Overall Progress</h3>
                            <div className="circular-progress">
                                <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Overall progress: ${overallProgress}%`}>
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        fill="none"
                                        stroke="#E5E7EB"
                                        strokeWidth="10"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        fill="none"
                                        stroke="#1e40af"
                                        strokeWidth="10"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallProgress / 100)}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                    />
                                    <text x="60" y="60" textAnchor="middle" dy="7" fontSize="24" fontWeight="700" fill="#1F2937">
                                        {overallProgress}%
                                    </text>
                                </svg>
                            </div>
                            <div className="progress-breakdown-simple">
                                <div className="breakdown-simple-item">
                                    <span className="breakdown-dot" style={{ background: '#1e40af' }}></span>
                                    <span>{completedVideos} Videos</span>
                                </div>
                                <div className="breakdown-simple-item">
                                    <span className="breakdown-dot" style={{ background: '#1e40af' }}></span>
                                    <span>{completedLessons} Lessons</span>
                                </div>
                                <div className="breakdown-simple-item">
                                    <span className="breakdown-dot" style={{ background: '#1e40af' }}></span>
                                    <span>{completedQuizzes} Quizzes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity + Progress Charts — full width below grid */}
                <div className="activity-charts-row">
                    <div className="section activity-section">
                        <div className="section-header">
                            <h2>Recent Activity</h2>
                        </div>
                        <div className="lessons-list">
                            {(progress.recentActivity || []).slice(0, 5).map((activity, index) => {
                                if (!activity || !activity.type || !activity.title) return null;
                                const icons = { video: 'V', lesson: 'L', quiz: 'Q', problems: 'P', guide: 'G' };
                                const colors = { video: '#1e40af', lesson: '#0d1b6e', quiz: '#2451c7', problems: '#dc2626', guide: '#059669' };
                                return (
                                    <div key={index} className="lesson-item" onClick={() => navigate('/resources')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
                                        <div className="lesson-icon" style={{ background: colors[activity.type] || '#6B7280' }}>{icons[activity.type] || ''}</div>
                                        <div className="lesson-info">
                                            <h4>{activity.title}</h4>
                                            <span className="lesson-meta">{activity.type ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1) : ''} • {activity.topic ? activity.topic.charAt(0).toUpperCase() + activity.topic.slice(1) : 'Mathematics'}</span>
                                        </div>
                                        <div className="lesson-date">{activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}</div>
                                    </div>
                                );
                            })}
                            {(!progress.recentActivity || progress.recentActivity.length === 0) && (
                                <div className="no-lessons"><p>Start learning to see your recent activity here!</p></div>
                            )}
                        </div>
                    </div>
                    <div className="charts-section">
                        <ProgressCharts progress={progress} />
                        <div className="dashboard-messages-card dashboard-messages-card--compact">
                            <div className="dashboard-messages-left">
                                <div className="dashboard-messages-icon">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="dashboard-messages-title">Messages</h3>
                                    <p className="dashboard-messages-sub">Send and receive messages from tutors and students</p>
                                </div>
                            </div>
                            <button className="dashboard-messages-btn" onClick={() => navigate('/messages')}>
                                Open Inbox
                            </button>
                        </div>
                    </div>
                </div>

                {/* Task Modal */}
                {showTaskModal && (
                    <div className="modal-overlay" onClick={() => setShowTaskModal(false)} role="presentation">
                        <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 id="task-modal-title">Add Daily Task</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowTaskModal(false)}
                                    aria-label="Close dialog"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Task Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Review trigonometry notes"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setShowTaskModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="submit-btn"
                                    onClick={addCustomTask}
                                    disabled={!newTask.trim()}
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Modal */}
                {reviewModal && (
                    <div className="modal-overlay" onClick={() => setReviewModal(null)} role="presentation">
                        <div className="modal-content" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Rate your session with {reviewModal.tutorName}</h2>
                                <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="review-stars-row">
                                    {[1,2,3,4,5].map(n => (
                                        <button
                                            key={n}
                                            className={`review-star-btn ${reviewStars >= n ? 'active' : ''}`}
                                            onClick={() => setReviewStars(n)}
                                            aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                                        >★</button>
                                    ))}
                                    {reviewStars > 0 && (
                                        <span className="review-star-label">
                                            {['','Poor','Fair','Good','Great','Excellent!'][reviewStars]}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Comment (optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="How was the session? What did you learn?"
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="cancel-btn" onClick={() => setReviewModal(null)}>Cancel</button>
                                <button className="submit-btn" onClick={submitReview} disabled={reviewStars === 0}>
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Agenda Modal */}
                {showAgendaModal && (
                    <div className="modal-overlay" onClick={() => setShowAgendaModal(false)} role="presentation">
                        <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="agenda-modal-title" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 id="agenda-modal-title">Schedule a Session</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowAgendaModal(false)}
                                    aria-label="Close dialog"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Session Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Algebra Tutoring Session"
                                        value={newAgendaItem.title}
                                        onChange={(e) => setNewAgendaItem({...newAgendaItem, title: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <select
                                        value={newAgendaItem.subject}
                                        onChange={(e) => setNewAgendaItem({...newAgendaItem, subject: e.target.value})}
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.map(subject => (
                                            <option key={subject.name} value={subject.name}>
                                                {subject.icon} {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={newAgendaItem.date}
                                            onChange={(e) => setNewAgendaItem({...newAgendaItem, date: e.target.value})}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={newAgendaItem.time}
                                            onChange={(e) => setNewAgendaItem({...newAgendaItem, time: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setShowAgendaModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="submit-btn"
                                    onClick={handleAddAgendaItem}
                                    disabled={!newAgendaItem.title || !newAgendaItem.subject || !newAgendaItem.date || !newAgendaItem.time}
                                >
                                    Schedule Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;