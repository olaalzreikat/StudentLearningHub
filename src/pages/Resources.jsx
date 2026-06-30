// Resources page — the main library where students browse classes, videos, quizzes, practice problems, and guides
import { useState, useEffect } from 'react';
import { videosData, quizzesData, problemsData, guidesData } from '../data/resourcesData';
import { classesData } from '../data/classesData';
import { lessonsData } from '../data/lessonsData';
import { getProgress, markAsComplete, addActivity, checkAndAwardAchievements } from '../utils/localStorage';
import { useFavorites } from '../contexts/FavoritesContext';
import { getSubjectColor } from '../utils/subjectColors';
import ClassModal from '../components/ClassModal';
import './Resources.css';

function Resources() {
    // Filter and search state
    const [activeFilter, setActiveFilter] = useState('all');   // subject filter (all / algebra / geometry …)
    const [searchQuery, setSearchQuery] = useState('');
    const [videoFilter, setVideoFilter] = useState('all');
    const [guideFilter, setGuideFilter] = useState('all');

    // Class modal state — which class is currently open
    const [selectedClass, setSelectedClass] = useState(null);

    // Progress completion map per class id
    const [classProgress, setClassProgress] = useState({});

    // Show more toggle for videos
    const [showAllVideos, setShowAllVideos] = useState(false);

    // Practice section toggle
    const [practiceTab, setPracticeTab] = useState('quizzes');

    // Trigger to reread progress after returning from a lesson/quiz tab
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Favorites — Firestore-backed via context
    const { favorites, toggleFavorite: _toggleFav, isFav } = useFavorites();

    const toggleFav = (type, id, e) => {
        e.stopPropagation();
        _toggleFav(type, id);
    };

    // Toast notification
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const showNotificationMessage = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };
    
    
    const progress = getProgress();

    useEffect(() => {
        calculateAllClassProgress();
        
        const handleStorageChange = () => {
            calculateAllClassProgress();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, [refreshTrigger]);

    const calculateAllClassProgress = () => {
        const progress = getProgress();
        const progressMap = {};

        classesData.forEach(classItem => {
            const allLessonIds = classItem.units.flatMap(unit => 
                unit.lessons.map(lesson => lesson.id)
            );

            const completedCount = allLessonIds.filter(lessonId => 
                progress.completedLessons?.includes(lessonId)
            ).length;

            const totalLessons = allLessonIds.length;
            const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            progressMap[classItem.id] = {
                completed: completedCount,
                total: totalLessons,
                percentage: percentage,
                started: completedCount > 0
            };
        });

        setClassProgress(progressMap);
    };

    // Helpers — check if a resource has already been completed/downloaded
    const isVideoCompleted = (videoId) => {
        return progress.completedVideos?.includes(videoId) || false;
    };

    const isQuizCompleted = (quizId) => {
        return progress.completedQuizzes?.includes(quizId) || false;
    };

    const isProblemCompleted = (problemId) => {
        return progress.completedProblems?.includes(problemId) || false;
    };

    const isGuideDownloaded = (guideId) => {
        return progress.completedGuides?.includes(guideId) || false;
    };

    const handleClassClick = (classItem) => {
        setSelectedClass(classItem);
    };

    const handleModalClose = () => {
        setSelectedClass(null);
        setRefreshTrigger(prev => prev + 1);
    };

    // Save lesson data to localStorage and open the lesson in a new tab
    const handleLessonStart = (lesson) => {
        const fullLesson = lessonsData.find(l => l.id === lesson.id);
        
        if (fullLesson) {
            localStorage.setItem('currentLesson', JSON.stringify(fullLesson));
        } else {
            // Fallback lesson data
            const fallbackLessonData = {
                id: lesson.id,
                title: lesson.title,
                description: lesson.description || `Learn about ${lesson.title}`,
                topic: selectedClass?.subject || 'mathematics',
                difficulty: selectedClass?.level?.toLowerCase() || 'intermediate',
                duration: lesson.duration,
                content: {
                    introduction: lesson.description || `Welcome to ${lesson.title}. In this lesson, you'll master essential concepts.`,
                    keyPoints: [
                        `Understanding ${lesson.title.toLowerCase()}`,
                        "Step-by-step problem solving techniques",
                        "Common applications and examples",
                        "Practice exercises to build mastery"
                    ],
                    examples: [
                        { 
                            problem: `Example problem for ${lesson.title}`, 
                            solution: "Step-by-step solution with explanation",
                            steps: [
                                "Identify the problem",
                                "Apply the appropriate method",
                                "Solve step by step",
                                "Verify the solution"
                            ]
                        },
                        { 
                            problem: `Practice problem for ${lesson.title}`, 
                            solution: "Detailed walkthrough of the solution",
                            steps: [
                                "Read the problem carefully",
                                "Choose your approach",
                                "Work through each step",
                                "Check your answer"
                            ]
                        }
                    ],
                    realWorldApplications: [
                        {
                            title: "Real-World Application",
                            example: `This concept applies to many practical situations in everyday life and various careers.`
                        }
                    ]
                }
            };
            
            localStorage.setItem('currentLesson', JSON.stringify(fallbackLessonData));
        }
        
        window.open('/lesson', '_blank');
        
        // Refresh progress after lesson window is opened
        setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
        }, 1000);
    };

    // Save selected resource to localStorage then open it in a new tab
    const handleVideoClick = (video) => {
        localStorage.setItem('currentVideo', JSON.stringify(video));
        window.open('/video', '_blank');
    };

    const handleQuizClick = (quiz) => {
        localStorage.setItem('currentQuiz', JSON.stringify(quiz));
        window.open('/quiz', '_blank');
    };

    const handleProblemClick = (problemSet) => {
        localStorage.setItem('currentProblemSet', JSON.stringify(problemSet));
        window.open('/problems', '_blank');
    };

    const handleGuideDownload = (guide) => {
        // Mark as completed immediately
        markAsComplete(guide.id, 'guide', guide.title, guide.topic);
        
        // Add activity
        addActivity('guide', guide.title, guide.topic);
        
        // Check achievements
        checkAndAwardAchievements();
        
        // Generate PDF
downloadFile(guide);        
        // Refresh UI
        setRefreshTrigger(prev => prev + 1);
    };

const downloadFile = (guide) => {
    // Create a link element
    const link = document.createElement('a');
    link.href = guide.fileUrl; 
    link.download = guide.fileName || `${guide.title}.pdf`; 
    link.target = '_blank'; // Open in new tab as fallback
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotificationMessage(`Downloaded: ${guide.title}`);
};
   

    // Filter functions
    const getFilteredData = () => {
        let classes = classesData;
        let videos = videosData;
        let quizzes = quizzesData;
        let problems = problemsData;
        let guides = guidesData;

        // Apply category filter
        if (activeFilter === 'saved') {
            const favs = favorites;
            classes  = classes.filter(c  => (favs.classes  || []).includes(String(c.id)));
            videos   = videos.filter(v   => (favs.videos   || []).includes(String(v.id)));
            quizzes  = quizzes.filter(q  => (favs.quizzes  || []).includes(String(q.id)));
            problems = problems.filter(p => (favs.problems  || []).includes(String(p.id)));
            guides   = guides.filter(g   => (favs.guides   || []).includes(String(g.id)));
        } else if (activeFilter !== 'all') {
            classes = classes.filter(c => c.subject.toLowerCase() === activeFilter);
            videos = videos.filter(v => v.topic && v.topic.toLowerCase() === activeFilter);
            quizzes = quizzes.filter(q => q.topic.toLowerCase() === activeFilter);
            problems = problems.filter(p => p.topic.toLowerCase() === activeFilter);
            guides = guides.filter(g => g.topic.toLowerCase() === activeFilter);
        }

        // Apply video class filter
        if (videoFilter !== 'all') {
            videos = videos.filter(v => v.class === videoFilter);
        }

        // Apply guide topic filter
        if (guideFilter !== 'all') {
            guides = guides.filter(g => g.topic.toLowerCase() === guideFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            classes = classes.filter(c => c.title.toLowerCase().includes(query));
            videos = videos.filter(v => v.title.toLowerCase().includes(query));
            quizzes = quizzes.filter(q => q.title.toLowerCase().includes(query));
            problems = problems.filter(p => p.title.toLowerCase().includes(query));
            guides = guides.filter(g => g.title.toLowerCase().includes(query));
        }

        return { classes, videos, quizzes, problems, guides };
    };

    const filtered = getFilteredData();
    const hasResults = filtered.classes.length > 0 || filtered.videos.length > 0 || 
                       filtered.quizzes.length > 0 || filtered.problems.length > 0 || 
                       filtered.guides.length > 0;

    // Show only 6 videos initially, or all if showAllVideos is true
    const displayedVideos = showAllVideos ? filtered.videos : filtered.videos.slice(0, 6);

    return (
        <div className="resources-page">
            {showNotification && (
                <div className="notification">{notificationMessage}</div>
            )}
            {/* Hero Section */}
            <div className="resources-hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="resources-eyebrow">
                            Student Resources
                        </div>
                        <h1>Learning Resources</h1>
                        <p>Everything you need to master mathematics</p>
                    </div>
                </div>
            </div>

            {/* Main Container */}
            <div className="resources-container">
                {/* Filter Bar */}
                <div className="category-filter-bar">
                    <div className="category-buttons">
                        <button 
                            className={`category-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`category-btn ${activeFilter === 'algebra' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('algebra')}
                        >
                            Algebra
                        </button>
                        <button 
                            className={`category-btn ${activeFilter === 'geometry' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('geometry')}
                        >
                            Geometry
                        </button>
                        <button
                            className={`category-btn ${activeFilter === 'calculus' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('calculus')}
                        >
                            Calculus
                        </button>
                        <button
                            className={`category-btn ${activeFilter === 'statistics' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('statistics')}
                        >
                            Statistics
                        </button>
                        <button
                            className={`category-btn ${activeFilter === 'trigonometry' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('trigonometry')}
                        >
                            Trigonometry
                        </button>
                        <button
                            className={`category-btn saved-filter-btn ${activeFilter === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('saved')}
                        >
                            <svg viewBox="0 0 24 24" fill={activeFilter === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            Saved
                        </button>
                    </div>

                    <div className="search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search learning resources"
                        />
                    </div>
                </div>

                {/* No Results */}
                {!hasResults && activeFilter !== 'saved' && (
                    <div className="no-resources">
                        No resources found. Try adjusting your filters.
                    </div>
                )}
                {!hasResults && activeFilter === 'saved' && (
                    <div className="saved-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <p>No saved resources yet</p>
                        <span>Tap the heart icon on any class, video, quiz, or guide to save it here</span>
                    </div>
                )}

                {/* FAVORITES SECTION — shown whenever anything is saved, hidden on 'saved' filter tab */}
                {activeFilter !== 'saved' && Object.values(favorites).some(arr => arr.length > 0) && (() => {
                    const HEART = <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
                    const chips = [
                        ...(favorites.classes  || []).map(id => { const item = classesData.find(c => String(c.id) === id);  return item ? { type: 'Class',   label: item.title,  onClick: () => handleClassClick(item), onRemove: e => toggleFav('classes',  item.id,  e) } : null; }),
                        ...(favorites.videos   || []).map(id => { const item = videosData.find(v => String(v.id)   === id); return item ? { type: 'Video',   label: item.title,  onClick: () => handleVideoClick(item), onRemove: e => toggleFav('videos',   item.id,  e) } : null; }),
                        ...(favorites.quizzes  || []).map(id => { const item = quizzesData.find(q => String(q.id)  === id); return item ? { type: 'Quiz',    label: item.title,  onClick: null,                         onRemove: e => toggleFav('quizzes',  item.id,  e) } : null; }),
                        ...(favorites.problems || []).map(id => { const item = problemsData.find(p => String(p.id) === id); return item ? { type: 'Problem', label: item.title,  onClick: null,                         onRemove: e => toggleFav('problems', item.id,  e) } : null; }),
                        ...(favorites.guides   || []).map(id => { const item = guidesData.find(g => String(g.id)   === id); return item ? { type: 'Guide',   label: item.title,  onClick: null,                         onRemove: e => toggleFav('guides',   item.id,  e) } : null; }),
                    ].filter(Boolean);
                    if (!chips.length) return null;
                    return (
                        <div className="favorites-section">
                            <div className="favorites-section-header">
                                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                Saved
                                <span className="fav-section-count">{chips.length}</span>
                            </div>
                            <div className="favorites-strip">
                                {chips.map((chip, i) => (
                                    <div key={i} className="fav-chip" onClick={chip.onClick || undefined} role={chip.onClick ? 'button' : undefined} tabIndex={chip.onClick ? 0 : undefined} onKeyDown={chip.onClick ? e => e.key === 'Enter' && chip.onClick() : undefined}>
                                        <span className="fav-chip-type">{chip.type}</span>
                                        <span className="fav-chip-title">{chip.label}</span>
                                        <button className="fav-chip-remove" onClick={chip.onRemove} aria-label="Remove from saved">{HEART}</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* CONTINUE LEARNING SECTION */}
                {/* CLASSES SECTION */}
                {filtered.classes.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Classes</h2>
                        </div>
                        <div className="classes-grid">
                            {filtered.classes.map((classItem) => {
                                const prog = classProgress[classItem.id] || { percentage: 0, total: 0, completed: 0, started: false };
                                const totalUnits = classItem.units.length;
                                const totalLessons = classItem.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
                                const totalMins = classItem.units.reduce((sum, unit) =>
                                    sum + unit.lessons.reduce((s, l) => s + parseInt(l.duration) || 0, 0), 0);
                                const estHours = Math.round(totalMins / 60 * 10) / 10;
                                const accent = getSubjectColor(classItem.subject);

                                return (
                                    <div key={classItem.id} className="lesson-card" style={{ '--card-accent': accent }} onClick={() => handleClassClick(classItem)}>
                                        <button className={`fav-btn fav-btn-card${isFav('classes', classItem.id) ? ' fav-active' : ''}`} onClick={e => toggleFav('classes', classItem.id, e)} aria-label={isFav('classes', classItem.id) ? 'Remove from saved' : 'Save'}>
                                            <svg viewBox="0 0 24 24" fill={isFav('classes', classItem.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                        </button>
                                        <div className="class-card-banner" style={{ background: accent }}>
                                            <div className="banner-math-bg" aria-hidden="true">
                                                <span>π</span>
                                                <span>∑</span>
                                                <span>√</span>
                                                <span>∫</span>
                                                <span>±</span>
                                                <span>Δ</span>
                                                <span>∞</span>
                                                <span>θ</span>
                                            </div>
                                            <span className="class-banner-letter">{classItem.title.charAt(0)}</span>
                                            <div className="class-banner-right">
                                                {classItem.level && (
                                                    <span className="class-banner-level">{classItem.level}</span>
                                                )}
                                                {prog.percentage > 0 && (
                                                    <span className="class-banner-pct">{prog.percentage}%</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="class-card-body">
                                            <h3 className="lesson-title">{classItem.title}</h3>
                                            {classItem.description && (
                                                <p className="class-description">{classItem.description}</p>
                                            )}
                                            <div className="class-meta-row">
                                                <span className="class-meta-item">{totalUnits} units</span>
                                                <span className="class-meta-dot">·</span>
                                                <span className="class-meta-item">{totalLessons} lessons</span>
                                                <span className="class-meta-dot">·</span>
                                                <span className="class-meta-item">~{estHours}h</span>
                                            </div>
                                            <div className="class-card-bottom">
                                                <div className="class-progress-container">
                                                    <div className="class-progress-row">
                                                        <span className="class-progress-text">{prog.percentage}% complete</span>
                                                        <span className="class-progress-text">{prog.completed} / {prog.total} lessons</span>
                                                    </div>
                                                    <div className="class-progress-bar">
                                                        <div className="class-progress-fill" style={{ width: `${prog.percentage}%`, background: accent }}></div>
                                                    </div>
                                                </div>
                                                <button className="class-action-btn" style={{ background: accent }}>
                                                    {prog.started ? 'Continue' : 'Start'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* VIDEOS SECTION */}
                {filtered.videos.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Videos</h2>
                            <select 
                                className="video-filter-dropdown"
                                value={videoFilter}
                                onChange={(e) => setVideoFilter(e.target.value)}
                            >
                                <option value="all">All Classes</option>
                                <option value="Algebra 1">Algebra 1</option>
                                <option value="Algebra 2">Algebra 2</option>
                                <option value="Geometry">Geometry</option>
                                <option value="Precalculus">Precalculus</option>
                                <option value="Calculus">Calculus</option>
                                <option value="Statistics">Statistics</option>
                                <option value="Trigonometry">Trigonometry</option>

                            </select>
                        </div>
                        <div className="videos-grid">
                            {displayedVideos.map((video) => {
                                const isCompleted = isVideoCompleted(video.id);
                                
                                return (
                                    <div key={video.id} className={`video-card${isCompleted ? ' video-card-done' : ''}`} style={{ '--card-accent': getSubjectColor(video.topic || '') }} onClick={() => handleVideoClick(video)} role="button" tabIndex={0} aria-label={`Watch video: ${video.title}`} onKeyDown={e => e.key === 'Enter' && handleVideoClick(video)}>
                                        <div className="video-card-top-row">
                                            {video.class && <div className="video-class-badge" style={{ background: getSubjectColor(video.topic || ''), color: '#fff' }}>{video.class}</div>}
                                            <button className={`fav-btn fav-btn-video${isFav('videos', video.id) ? ' fav-active' : ''}`} onClick={e => toggleFav('videos', video.id, e)} aria-label={isFav('videos', video.id) ? 'Remove from saved' : 'Save'}>
                                                <svg viewBox="0 0 24 24" fill={isFav('videos', video.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                            </button>
                                        </div>
                                        <div className="video-preview">
                                            {video.videoUrl ? (
                                                <iframe
                                                    src={video.videoUrl}
                                                    title={video.title}
                                                    style={{ pointerEvents: 'none' }}
                                                />
                                            ) : (
                                                <div className="play-icon"></div>
                                            )}
                                            {video.duration && <span className="video-duration-badge">{video.duration}</span>}
                                        </div>
                                        <div className="video-info">
                                            <h4 className="video-title">{video.title}</h4>
                                        </div>
                                        <button className={`video-watch-btn${isCompleted ? ' video-watch-btn-done' : ''}`}>
                                            {isCompleted ? 'Rewatch' : 'Watch'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        {filtered.videos.length > 6 && (
                            <button 
                                className="show-more-btn"
                                onClick={() => setShowAllVideos(!showAllVideos)}
                            >
                                {showAllVideos ? '▲ Show Less' : `▼ Show ${filtered.videos.length - 6} More Videos`}
                            </button>
                        )}
                    </div>
                )}

                {/* PRACTICE SECTION — Quizzes + Problems with toggle */}
                {(filtered.quizzes.length > 0 || filtered.problems.length > 0) && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Practice</h2>
                            <div className="practice-toggle">
                                <button
                                    className={`practice-toggle-btn ${practiceTab === 'quizzes' ? 'active' : ''}`}
                                    onClick={() => setPracticeTab('quizzes')}
                                >
                                    Quizzes
                                    {filtered.quizzes.length > 0 && (
                                        <span className="practice-toggle-count">{filtered.quizzes.length}</span>
                                    )}
                                </button>
                                <button
                                    className={`practice-toggle-btn ${practiceTab === 'problems' ? 'active' : ''}`}
                                    onClick={() => setPracticeTab('problems')}
                                >
                                    Problems
                                    {filtered.problems.length > 0 && (
                                        <span className="practice-toggle-count">{filtered.problems.length}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {practiceTab === 'quizzes' && (
                            filtered.quizzes.length > 0 ? (
                                <div className="quizzes-grid">
                                    {filtered.quizzes.map((quiz) => {
                                        const isCompleted = isQuizCompleted(quiz.id);
                                        const color = getSubjectColor(quiz.topic);
                                        const letter = quiz.topic.charAt(0).toUpperCase();
                                        return (
                                            <div key={quiz.id} className={`practice-card${isCompleted ? ' practice-card-done' : ''}`} style={{ '--practice-color': color, background: color + '08' }} onClick={() => handleQuizClick(quiz)} role="button" tabIndex={0} aria-label={`${isCompleted ? 'Retake' : 'Start'} quiz: ${quiz.title}`} onKeyDown={e => e.key === 'Enter' && handleQuizClick(quiz)}>
                                                <div className="practice-card-left">
                                                    <div className="practice-info">
                                                        <div className="practice-type-row">
                                                            <span className="practice-type-badge" style={{ color, background: color + '22' }}>Quiz</span>
                                                            <span className="practice-topic-pill">{quiz.topic}</span>
                                                        </div>
                                                        <h4 className="quiz-title">{quiz.title}</h4>
                                                        <p className="quiz-description">{quiz.description}</p>
                                                        <p className="quiz-duration">{quiz.questions} questions · {quiz.duration}</p>
                                                    </div>
                                                </div>
                                                <div className="practice-card-actions">
                                                <button className={`fav-btn${isFav('quizzes', quiz.id) ? ' fav-active' : ''}`} onClick={e => toggleFav('quizzes', quiz.id, e)} aria-label={isFav('quizzes', quiz.id) ? 'Remove from saved' : 'Save'}>
                                                    <svg viewBox="0 0 24 24" fill={isFav('quizzes', quiz.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                                </button>
                                                <button
                                                    className={`practice-start-btn${isCompleted ? ' practice-start-done' : ''}`}
                                                    style={!isCompleted ? { background: color } : {}}
                                                    onClick={(e) => { e.stopPropagation(); handleQuizClick(quiz); }}
                                                >
                                                    {isCompleted ? 'Retake' : 'Start'}
                                                </button>
                                            </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="practice-empty">No quizzes match your current filter.</div>
                            )
                        )}

                        {practiceTab === 'problems' && (
                            filtered.problems.length > 0 ? (
                                <div className="quizzes-grid">
                                    {filtered.problems.map((problem) => {
                                        const isCompleted = isProblemCompleted(problem.id);
                                        const color = getSubjectColor(problem.topic);
                                        const letter = problem.topic.charAt(0).toUpperCase();
                                        return (
                                            <div key={problem.id} className={`practice-card${isCompleted ? ' practice-card-done' : ''}`} style={{ '--practice-color': color, background: color + '08' }} onClick={() => handleProblemClick(problem)} role="button" tabIndex={0} aria-label={`${isCompleted ? 'Retake' : 'Start'} problems: ${problem.title}`} onKeyDown={e => e.key === 'Enter' && handleProblemClick(problem)}>
                                                <div className="practice-card-left">
                                                    <div className="practice-info">
                                                        <div className="practice-type-row">
                                                            <span className="practice-type-badge" style={{ color, background: color + '22' }}>Problem Set</span>
                                                            <span className="practice-topic-pill">{problem.topic}</span>
                                                        </div>
                                                        <h4 className="quiz-title">{problem.title}</h4>
                                                        <p className="quiz-description">{problem.description}</p>
                                                        <p className="quiz-duration">{problem.problems.length} problems · {problem.duration}</p>
                                                    </div>
                                                </div>
                                                <div className="practice-card-actions">
                                                <button className={`fav-btn${isFav('problems', problem.id) ? ' fav-active' : ''}`} onClick={e => toggleFav('problems', problem.id, e)} aria-label={isFav('problems', problem.id) ? 'Remove from saved' : 'Save'}>
                                                    <svg viewBox="0 0 24 24" fill={isFav('problems', problem.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                                </button>
                                                <button
                                                    className={`practice-start-btn${isCompleted ? ' practice-start-done' : ''}`}
                                                    style={!isCompleted ? { background: color } : {}}
                                                    onClick={(e) => { e.stopPropagation(); handleProblemClick(problem); }}
                                                >
                                                    {isCompleted ? 'Retake' : 'Start'}
                                                </button>
                                            </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="practice-empty">No problems match your current filter.</div>
                            )
                        )}
                    </div>
                )}

                {/* DOWNLOADABLE MATERIALS SECTION */}
                {filtered.guides.length > 0 && (
                    <div className="resource-section">
                        <div className="section-header">
                            <h2>Downloadable Material</h2>
                            <select 
                                className="guide-filter-dropdown"
                                value={guideFilter}
                                onChange={(e) => setGuideFilter(e.target.value)}
                            >
                                <option value="all">All classes</option>
                                <option value="algebra">Algebra</option>
                                <option value="geometry">Geometry</option>
                                <option value="calculus">Calculus</option>
                                <option value="statistics">Statistics</option>
                            </select>
                        </div>
                        <div className="downloads-grid">
                            {filtered.guides.map((guide) => {
                                const isDownloaded = isGuideDownloaded(guide.id);
                                
                                return (
                                    <div key={guide.id} className="download-card" style={{ '--card-accent': getSubjectColor(guide.topic), background: getSubjectColor(guide.topic) + '08' }}>
                                        <button className={`fav-btn fav-btn-download${isFav('guides', guide.id) ? ' fav-active' : ''}`} onClick={e => toggleFav('guides', guide.id, e)} aria-label={isFav('guides', guide.id) ? 'Remove from saved' : 'Save'}>
                                            <svg viewBox="0 0 24 24" fill={isFav('guides', guide.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                        </button>
                                        <div className="download-content">
                                            <h4 className="download-title">{guide.title}</h4>
                                            <p className="download-description">{guide.description}</p>
                                            <div className="download-meta">
                                                <span>{guide.pages}</span>
                                                <span className="meta-separator">•</span>
                                                <span>{guide.size}</span>
                                            </div>
                                        </div>
                                        <button className={`download-btn${isDownloaded ? ' download-btn-done' : ''}`} onClick={(e) => { e.stopPropagation(); handleGuideDownload(guide); }} aria-label={`${isDownloaded ? 'Re-download' : 'Download'} ${guide.title}`}>
                                            {isDownloaded ? 'Re-download' : 'Download'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Class Modal */}
            {selectedClass && (
                <ClassModal 
                    classData={selectedClass}
                    onClose={handleModalClose}
                    onLessonStart={handleLessonStart}
                />
            )}
        </div>
    );
}

export default Resources;
