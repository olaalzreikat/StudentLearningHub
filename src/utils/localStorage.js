import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

let _currentUserId = null;
export const setCurrentUser = (uid) => { _currentUserId = uid; };
const getProgressKey = () => _currentUserId ? `mathmaster-progress-${_currentUserId}` : 'mathmaster-progress';
const getAgendaKey = () => _currentUserId ? `agendaItems-${_currentUserId}` : 'agendaItems';
const getDailyTasksKey = () => _currentUserId ? `dailyTasks-${_currentUserId}` : 'dailyTasks';
const getQuizScoresKey = () => _currentUserId ? `quizScores-${_currentUserId}` : 'quizScores';

export { getAgendaKey, getDailyTasksKey, getQuizScoresKey };

export const loadProgressFromFirestore = async (uid) => {
    try {
        const snap = await Promise.race([
            getDoc(doc(db, 'users', uid)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ]);
        if (snap.exists()) {
            const data = snap.data();
            return data.progress || null;
        }
    } catch {
        // Firestore unavailable — localStorage is the source of truth
    }
    return null;
};

// Initial progress structure
const INITIAL_PROGRESS = {
    completedActivities: 0,
    achievements: [],
    streak: 0,
    lastActivity: null,
    studyTime: 0,
    subjectProgress: {
        algebra: 0,
        geometry: 0,
        calculus: 0,
        trigonometry: 0,
        statistics: 0
    },
    recentActivity: [],
    completedVideos: [],
    completedQuizzes: [],
    completedProblems: [],
    completedLessons: [],
    completedGuides: []
};

// Get progress from localStorage
export const getProgress = () => {
    const savedProgress = localStorage.getItem(getProgressKey());
    
    if (!savedProgress) {
        // If no progress exists, create initial progress
        localStorage.setItem(getProgressKey(), JSON.stringify(INITIAL_PROGRESS));
        return INITIAL_PROGRESS;
    }
    
    try {
        const progress = JSON.parse(savedProgress);
        
        // Ensure all required fields exist (for backward compatibility)
        return {
            ...INITIAL_PROGRESS,
            ...progress,
            completedVideos: progress.completedVideos || [],
            completedQuizzes: progress.completedQuizzes || [],
            completedProblems: progress.completedProblems || [],
            completedLessons: progress.completedLessons || [],
            completedGuides: progress.completedGuides || [],
            recentActivity: progress.recentActivity || []
        };
    } catch (error) {
        console.error('Error parsing progress:', error);
        return INITIAL_PROGRESS;
    }
};

// Save progress to localStorage and fire-and-forget sync to Firestore
export const saveProgress = (progress) => {
    localStorage.setItem(getProgressKey(), JSON.stringify(progress));
    if (_currentUserId) {
        setDoc(doc(db, 'users', _currentUserId), { progress }, { merge: true }).catch(() => {});
    }
};

// Check if an item is completed
export const isCompleted = (id, type) => {
    const progress = getProgress();
    
    switch(type) {
        case 'video':
            return progress.completedVideos?.includes(id) || false;
        case 'lesson':
            return progress.completedLessons?.includes(id) || false;
        case 'quiz':
            return progress.completedQuizzes?.includes(id) || false;
        case 'problem':
            return progress.completedProblems?.includes(id) || false;
        case 'guide':
            return progress.completedGuides?.includes(id) || false;
        default:
            return false;
    }
};

// Mark an item as complete
export const markAsComplete = (id, type, title = '', topic = '') => {
    const progress = getProgress();
    
    // Determine which array to update
    let completedArray;
    let activityType;
    
    switch(type) {
        case 'video':
            completedArray = 'completedVideos';
            activityType = 'video';
            break;
        case 'lesson':
            completedArray = 'completedLessons';
            activityType = 'lesson';
            break;
        case 'quiz':
            completedArray = 'completedQuizzes';
            activityType = 'quiz';
            break;
        case 'problem':
            completedArray = 'completedProblems';
            activityType = 'problems';
            break;
        case 'guide':
            completedArray = 'completedGuides';
            activityType = 'guide';
            break;
        default:
            return;
    }
    
    // Add to completed array if not already there
    if (!progress[completedArray].includes(id)) {
        progress[completedArray].push(id);
        
        // Add to recent activity
        if (title && topic) {
            const activity = {
                type: activityType,
                title: title,
                topic: topic,
                timestamp: new Date().toISOString()
            };
            
            progress.recentActivity = [activity, ...(progress.recentActivity || [])];
            
            // Keep only last 20 activities
            if (progress.recentActivity.length > 20) {
                progress.recentActivity = progress.recentActivity.slice(0, 20);
            }
        }
        
        progress.completedActivities = (progress.completedActivities || 0) + 1;
        progress.lastActivity = new Date().toISOString();
        
        saveProgress(progress);
        checkAndAwardAchievements();
    }
};

// Add activity to recent activity
export const addActivity = (type, title, topic) => {
    const progress = getProgress();

    // Skip duplicate: same resource already logged today
    const today = new Date().toDateString();
    const alreadyToday = (progress.recentActivity || []).some(a =>
        a.title === title && new Date(a.timestamp).toDateString() === today
    );

    if (!alreadyToday) {
        const activity = {
            type,
            title,
            topic,
            timestamp: new Date().toISOString()
        };
        progress.recentActivity = [activity, ...(progress.recentActivity || [])];
        if (progress.recentActivity.length > 20) {
            progress.recentActivity = progress.recentActivity.slice(0, 20);
        }
    }
    
    // Update streak: increment if yesterday, reset if gap, keep if already active today
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastDay = progress.lastActivity ? new Date(progress.lastActivity).toDateString() : null;
    if (lastDay === today) {
        // already active today — streak stays the same
    } else if (lastDay === yesterday) {
        progress.streak = (progress.streak || 0) + 1;
    } else {
        progress.streak = 1;
    }

    progress.completedActivities = (progress.completedActivities || 0) + 1;
    progress.lastActivity = new Date().toISOString();

    saveProgress(progress);
};

// Check and award achievements
export const checkAndAwardAchievements = () => {
    const progress = getProgress();
    
    if (!progress.achievements) {
        progress.achievements = [];
    }
    
    // First Video achievement
    if (progress.completedVideos && progress.completedVideos.length === 1 && 
        !progress.achievements.some(a => a.name === 'First Steps')) {
        progress.achievements.push({
            name: 'First Steps',
            description: 'Watched your first video',
            date: new Date().toISOString()
        });
    }
    
    // 5 Videos achievement
    if (progress.completedVideos && progress.completedVideos.length >= 5 && 
        !progress.achievements.some(a => a.name === 'Video Enthusiast')) {
        progress.achievements.push({
            name: 'Video Enthusiast',
            description: 'Watched 5 videos',
            date: new Date().toISOString()
        });
    }
    
    // First Quiz achievement
    if (progress.completedQuizzes && progress.completedQuizzes.length === 1 && 
        !progress.achievements.some(a => a.name === 'Quiz Master')) {
        progress.achievements.push({
            name: 'Quiz Master',
            description: 'Completed your first quiz',
            date: new Date().toISOString()
        });
    }
    
    // First Lesson achievement
    if (progress.completedLessons && progress.completedLessons.length === 1 && 
        !progress.achievements.some(a => a.name === 'Knowledge Seeker')) {
        progress.achievements.push({
            name: 'Knowledge Seeker',
            description: 'Completed your first lesson',
            date: new Date().toISOString()
        });
    }
    
    saveProgress(progress);
};