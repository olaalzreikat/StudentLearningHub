// Resources page — the main library where students browse classes, videos, quizzes, practice problems, and guides
import { useState, useEffect } from 'react';
import { videosData, quizzesData, problemsData, guidesData } from '../data/resourcesData';
import { classesData } from '../data/classesData';
import { lessonsData } from '../data/lessonsData';
import { getProgress, markAsComplete, addActivity, checkAndAwardAchievements } from '../utils/localStorage';
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
        if (activeFilter !== 'all') {
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

                    </div>

                    <div className="search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* No Results */}
                {!hasResults && (
                    <div className="no-resources">
                        No resources found. Try adjusting your filters.
                    </div>
                )}

                {/* CONTINUE LEARNING SECTION */}
                {(() => {
                    const inProgress = classesData.filter(c => {
                        const p = classProgress[c.id];
                        return p && p.started && p.percentage < 100;
                    });
                    if (inProgress.length === 0) return null;
                    return (
                        <div className="resource-section">
                            <div className="section-header">
                                <h2>Continue Learning</h2>
                            </div>
                            <div className="continue-grid">
                                {inProgress.slice(0, 3).map(classItem => {
                                    const prog = classProgress[classItem.id];
                                    const accent = getSubjectColor(classItem.subject);
                                    return (
                                        <div key={classItem.id} className="continue-card" onClick={() => handleClassClick(classItem)}>
                                            <div className="continue-card-stripe" style={{ background: accent }} />
                                            <div className="continue-card-content">
                                                <div className="continue-card-icon" style={{ background: accent + '18', color: accent }}>
                                                    {classItem.title.charAt(0)}
                                                </div>
                                                <div className="continue-card-info">
                                                    <div className="continue-card-title">{classItem.title}</div>
                                                    <div className="continue-card-sub">{prog.completed}/{prog.total} lessons · {prog.percentage}%</div>
                                                    <div className="continue-bar-wrap">
                                                        <div className="continue-bar-fill" style={{ width: `${prog.percentage}%`, background: accent }} />
                                                    </div>
                                                </div>
                                                <button className="continue-btn" style={{ background: accent }}>Continue →</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

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
                                    <div key={classItem.id} className="lesson-card" onClick={() => handleClassClick(classItem)}>
                                        <div className="class-card-banner" style={{ background: accent }}>
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
                                    <div key={video.id} className={`video-card${isCompleted ? ' video-card-done' : ''}`} style={{ borderTop: `3px solid ${getSubjectColor(video.topic || '')}` }} onClick={() => handleVideoClick(video)}>
                                        <div className="video-background"></div>
                                        <div className="video-card-top-row">
                                            {video.class && <div className="video-class-badge" style={{ color: getSubjectColor(video.topic || ''), background: getSubjectColor(video.topic || '') + '15' }}>{video.class}</div>}
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
                                        </div>
                                        <div className="video-info">
                                            <h4 className="video-title">{video.title}</h4>
                                            <p className="video-duration"> {video.duration}</p>
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
                                            <div key={quiz.id} className={`practice-card${isCompleted ? ' practice-card-done' : ''}`} style={{ '--practice-color': color, borderColor: color + '40', background: color + '06' }} onClick={() => handleQuizClick(quiz)}>
                                                <div className="practice-card-left">
                                                    <div className="practice-icon" style={{ background: color, color: 'white' }}>{letter}</div>
                                                    <div className="practice-info">
                                                        <h4 className="quiz-title">{quiz.title}</h4>
                                                        <p className="quiz-description">{quiz.description}</p>
                                                        <p className="quiz-duration">{quiz.questions} questions · {quiz.duration}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className={`practice-start-btn${isCompleted ? ' practice-start-done' : ''}`}
                                                    style={!isCompleted ? { background: color } : {}}
                                                    onClick={(e) => { e.stopPropagation(); handleQuizClick(quiz); }}
                                                >
                                                    {isCompleted ? 'Retake' : 'Start'}
                                                </button>
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
                                            <div key={problem.id} className={`practice-card${isCompleted ? ' practice-card-done' : ''}`} style={{ '--practice-color': color, borderColor: color + '40', background: color + '06' }} onClick={() => handleProblemClick(problem)}>
                                                <div className="practice-card-left">
                                                    <div className="practice-icon" style={{ background: color, color: 'white' }}>{letter}</div>
                                                    <div className="practice-info">
                                                        <h4 className="quiz-title">{problem.title}</h4>
                                                        <p className="quiz-description">{problem.description}</p>
                                                        <p className="quiz-duration">{problem.problems.length} problems · {problem.duration}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className={`practice-start-btn${isCompleted ? ' practice-start-done' : ''}`}
                                                    style={!isCompleted ? { background: color } : {}}
                                                    onClick={(e) => { e.stopPropagation(); handleProblemClick(problem); }}
                                                >
                                                    {isCompleted ? 'Retake' : 'Start'}
                                                </button>
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
                                    <div key={guide.id} className="download-card" style={{ borderTop: `3px solid ${getSubjectColor(guide.topic)}` }}>
                                        <div className="download-content">
                                            <h4 className="download-title">{guide.title}</h4>
                                            <p className="download-description">{guide.description}</p>
                                            <div className="download-meta">
                                                <span>{guide.pages}</span>
                                                <span className="meta-separator">•</span>
                                                <span>{guide.size}</span>
                                            </div>
                                        </div>
                                        <button className={`download-btn${isDownloaded ? ' download-btn-done' : ''}`} onClick={(e) => { e.stopPropagation(); handleGuideDownload(guide); }}>
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
