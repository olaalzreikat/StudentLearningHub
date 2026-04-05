// Dashboard page — shows the user's progress overview, quick actions, and upcoming schedule
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress } from '../utils/localStorage';
import { videosData, quizzesData, problemsData, lessonsData, guidesData } from '../data/resourcesData';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();

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
            const savedAgenda = localStorage.getItem('agendaItems');
            if (savedAgenda) {
                setAgendaItems(JSON.parse(savedAgenda));
            }

            // Load daily tasks from localStorage
            const savedTasks = localStorage.getItem('dailyTasks');
            const today = new Date().toDateString();
            if (savedTasks) {
                const tasksData = JSON.parse(savedTasks);
                // Reset tasks if it's a new day
                if (tasksData.date !== today) {
                    const resetTasks = tasksData.tasks.map(task => ({ ...task, completed: false }));
                    const newTasksData = { date: today, tasks: resetTasks };
                    localStorage.setItem('dailyTasks', JSON.stringify(newTasksData));
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
                localStorage.setItem('dailyTasks', JSON.stringify(tasksData));
                setDailyTasks(defaultTasks);
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
        localStorage.setItem('dailyTasks', JSON.stringify({ date: today, tasks: updatedTasks }));
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
            localStorage.setItem('dailyTasks', JSON.stringify({ date: today, tasks: updatedTasks }));
            setNewTask('');
            setShowTaskModal(false);
            showNotificationMessage('New task added to your daily goals!');
        }
    };

    const removeTask = (taskId) => {
        const updatedTasks = dailyTasks.filter(task => task.id !== taskId);
        setDailyTasks(updatedTasks);
        const today = new Date().toDateString();
        localStorage.setItem('dailyTasks', JSON.stringify({ date: today, tasks: updatedTasks }));
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
            localStorage.setItem('agendaItems', JSON.stringify(updatedAgenda));
            setNewAgendaItem({ title: '', subject: '', date: '', time: '' });
            setShowAgendaModal(false);
            showNotificationMessage('Session scheduled successfully!');
        }
    };

    const handleRemoveAgendaItem = (index) => {
        const removedItem = agendaItems[index];
        const updatedAgenda = agendaItems.filter((_, i) => i !== index);
        setAgendaItems(updatedAgenda);
        localStorage.setItem('agendaItems', JSON.stringify(updatedAgenda));
        
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
    const quizScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
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
    const subjects = [
        { name: 'Algebra', icon: 'A', color: '#1e40af' },
        { name: 'Geometry', icon: 'G', color: '#7c3aed' },
        { name: 'Calculus', icon: 'C', color: '#059669' },
        { name: 'Trigonometry', icon: 'T', color: '#dc2626' },
        { name: 'Statistics', icon: 'S', color: '#d97706' }
    ];

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
            <div className="dashboard-container">
                {/* Notification aria-live makes screen readers announce it automatically */}
                <div role="status" aria-live="polite" aria-atomic="true">
                    {showNotification && (
                        <div className="notification">
                            {notificationMessage}
                        </div>
                    )}
                </div>

                {/* Welcome Banner Enhanced */}
                <div className="welcome-banner-enhanced">
                    <div className="welcome-content-enhanced">
                        <div className="welcome-text-section">
                            <h1>{getGreeting()}</h1>
                            <p>Welcome back to your learning journey</p>
                            <div className="welcome-stats">
                                <div className="stat-bubble">
                                    <span className="stat-number">{completedTasksCount}/{totalTasksCount}</span>
                                    <span className="stat-label">Tasks Today</span>
                                </div>
                                <div className="stat-bubble">
                                    <span className="stat-number">{completedResources}</span>
                                    <span className="stat-label">Completed</span>
                                </div>
                                <div className="stat-bubble">
                                    <span className="stat-number">{overallProgress}%</span>
                                    <span className="stat-label">Overall Progress</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className="quick-action-card"
                                onClick={action.action}
                                style={{ background: action.tint, borderLeftColor: action.accent }}
                            >
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
                                <button className="icon-btn" onClick={() => setShowTaskModal(true)} aria-label="Add new task">➕</button>
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

                        {/* Recent Activity */}
                        <div className="section">
                            <div className="section-header">
                                <h2>Recent Activity</h2>
                                <button 
                                    className="more-btn"
                                    onClick={() => setShowAllLessons(!showAllLessons)}
                                >
                                    {showAllLessons ? 'Less' : 'More'}
                                </button>
                            </div>
                            <div className="lessons-list">
                                {lessonsToDisplay && lessonsToDisplay.map((activity, index) => {
                                    if (!activity || !activity.type || !activity.title) return null;
                                    
                                    const icons = {
                                        video: 'V',
                                        lesson: 'L',
                                        quiz: 'Q',
                                        problems: 'P',
                                        guide: 'G'
                                    };

                                    const colors = {
                                        video: '#1e40af',
                                        lesson: '#0d1b6e',
                                        quiz: '#2451c7',
                                        problems: '#dc2626',
                                        guide: '#059669'
                                    };

                                    return (
                                        <div
                                            key={index}
                                            className="lesson-item"
                                            onClick={() => navigate('/resources')}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`${capitalizeFirst(activity.type)}: ${activity.title}`}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/resources'); }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="lesson-icon" style={{ background: colors[activity.type] || '#6B7280' }}>
                                                {icons[activity.type] || ''}
                                            </div>
                                            <div className="lesson-info">
                                                <h4>{activity.title}</h4>
                                                <span className="lesson-meta">
                                                    {capitalizeFirst(activity.type)} • {activity.topic ? capitalizeFirst(activity.topic) : 'Mathematics'}
                                                </span>
                                            </div>
                                            <div className="lesson-date">
                                                {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!progress.recentActivity || progress.recentActivity.length === 0) && (
                                    <div className="no-lessons">
                                        <p>Start learning to see your recent activity here!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                        {/* Statistics */}
                        <div className="statistics-card">
                            <div className="stats-header">
                                <h3>Your Statistics</h3>
                            </div>
                            
                            <div className="stats-grid-small">
                                <div className="stat-box" style={{ borderBottom: '3px solid #1e40af' }}>
                                    <div className="stat-box-label">Videos</div>
                                    <div className="stat-box-number" style={{ color: '#1e40af' }}>{completedVideos}</div>
                                    <div className="stat-box-sublabel">of {totalVideos}</div>
                                </div>
                                <div className="stat-box" style={{ borderBottom: '3px solid #059669' }}>
                                    <div className="stat-box-label">Lessons</div>
                                    <div className="stat-box-number" style={{ color: '#059669' }}>{completedLessons}</div>
                                    <div className="stat-box-sublabel">of {totalLessons}</div>
                                </div>
                                <div className="stat-box" style={{ borderBottom: '3px solid #d97706' }}>
                                    <div className="stat-box-label">Quizzes</div>
                                    <div className="stat-box-number" style={{ color: '#d97706' }}>{completedQuizzes}</div>
                                    <div className="stat-box-sublabel">of {totalQuizzes}</div>
                                </div>
                                <div className="stat-box" style={{ borderBottom: '3px solid #7c3aed' }}>
                                    <div className="stat-box-label">Problems</div>
                                    <div className="stat-box-number" style={{ color: '#7c3aed' }}>{completedProblems}</div>
                                    <div className="stat-box-sublabel">of {totalProblems}</div>
                                </div>
                            </div>
                        </div>

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
                                    <span className="breakdown-dot" style={{ background: '#059669' }}></span>
                                    <span>{completedLessons} Lessons</span>
                                </div>
                                <div className="breakdown-simple-item">
                                    <span className="breakdown-dot" style={{ background: '#d97706' }}></span>
                                    <span>{completedQuizzes} Quizzes</span>
                                </div>
                            </div>
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