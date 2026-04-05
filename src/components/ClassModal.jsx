import { useState, useEffect } from 'react';
import { getProgress } from '../utils/localStorage';
import { videosData, quizzesData, guidesData } from '../data/resourcesData';
import './ClassModal.css';

function ClassModal({ classData, onClose, onLessonStart }) {
    const [expandedUnits, setExpandedUnits] = useState([]);
    const [completedLessons, setCompletedLessons] = useState([]);

    // Refresh progress when modal opens or window regains focus
    useEffect(() => {
        const refreshProgress = () => {
            const progress = getProgress();
            setCompletedLessons(progress.completedLessons || []);
            console.log('✓ ClassModal: Refreshed progress', progress.completedLessons); // Debug log
        };

        // Initial load
        refreshProgress();

        // Refresh when window regains focus (e.g., after closing lesson tab)
        const handleFocus = () => {
            console.log('✓ ClassModal: Window focused, refreshing progress'); // Debug log
            refreshProgress();
        };

        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [classData]); // Re-run when classData changes (modal opens)

    const toggleUnit = (unitId) => {
        if (expandedUnits.includes(unitId)) {
            setExpandedUnits(expandedUnits.filter(id => id !== unitId));
        } else {
            setExpandedUnits([...expandedUnits, unitId]);
        }
    };

    const handleLessonClick = (lesson) => {
        onLessonStart(lesson);
        onClose();
    };

    const isLessonCompleted = (lessonId) => {
        return completedLessons.includes(lessonId);
    };

    // Find next incomplete lesson
    const getNextLesson = () => {
        for (let unit of classData.units) {
            for (let lesson of unit.lessons) {
                if (!isLessonCompleted(lesson.id)) {
                    return { unit, lesson };
                }
            }
        }
        return null;
    };

    // Calculate progress
    const calculateProgress = () => {
        const allLessons = classData.units.flatMap(u => u.lessons);
        const completed = allLessons.filter(l => isLessonCompleted(l.id)).length;
        const total = allLessons.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
    };

    // Count resources
    const countResources = () => {
        const className = classData.title.toLowerCase();
        const classSubject = classData.subject.toLowerCase();

        const videoCount = videosData.filter(video => 
            video.class && video.class.toLowerCase().includes(className)
        ).length;

        const quizCount = quizzesData.filter(quiz => 
            quiz.topic && quiz.topic.toLowerCase() === classSubject
        ).length;

        const guideCount = guidesData.filter(guide => 
            guide.topic && guide.topic.toLowerCase() === classSubject
        ).length;

        return { videos: videoCount, quizzes: quizCount, guides: guideCount };
    };

    const progress = calculateProgress();
    const nextLesson = getNextLesson();
    const resources = countResources();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                {/* Header with Image */}
                <div className="modal-header">
                    <div className="class-image">
                        <span>{classData.subject}</span>
                    </div>
                    <div className="header-info">
                        <h2 className="modal-title">{classData.title}</h2>
                        <p className="modal-description">{classData.description}</p>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="modal-body">
                    {/* Continue Section */}
                    {nextLesson && (
                        <div className="continue-section">
                            <div className="continue-header">
                                <span>Continue where you left off:</span>
                            </div>
                            <div className="continue-lesson">
                                <div className="continue-info">
                                    <div className="continue-title">
                                        {nextLesson.unit.title}: {nextLesson.lesson.title}
                                    </div>
                                    <div className="continue-duration">{nextLesson.lesson.duration}</div>
                                </div>
                                <button onClick={() => handleLessonClick(nextLesson.lesson)}>
                                    Continue 
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Resources */}
                    <div className="resource-links">
                        <div className="resource-item">
                            <span>-</span>
                            <span>Videos for this class ({resources.videos})</span>
                        </div>
                        <div className="resource-item">
                            <span>-</span>
                            <span>Quizzes for this class ({resources.quizzes})</span>
                        </div>
                        <div className="resource-item">
                            <span>-</span>
                            <span>Study guides for this class ({resources.guides})</span>
                        </div>
                    </div>

                    {/* Units */}
                    <h3 className="units-heading">Units</h3>
                    {classData.units.map((unit, unitIndex) => (
                        <div key={unit.id} className="unit-section">
                            <div 
                                className={`unit-header ${expandedUnits.includes(unit.id) ? 'expanded' : ''}`}
                                onClick={() => toggleUnit(unit.id)}
                            >
                                <div className="unit-title-wrapper">
                                    <span className="unit-number">UNIT {unitIndex + 1}</span>
                                    <h3 className="unit-title">
                                        {unit.title} • {unit.lessons.length} lessons
                                    </h3>
                                </div>
                                <span className={`expand-icon ${expandedUnits.includes(unit.id) ? 'rotated' : ''}`}>
                                    ▼
                                </span>
                            </div>

                            {expandedUnits.includes(unit.id) && (
                                <div className="lessons-list">
                                    {unit.lessons.map((lesson, lessonIndex) => {
                                        const completed = isLessonCompleted(lesson.id);
                                        return (
                                            <div key={lesson.id} className={`lesson-item ${completed ? 'completed' : ''}`}>
                                                <div className="lesson-info">
                                                    <div className="lesson-name">
                                                        {lesson.title}
                                                        {completed && <span className="check">✓ completed</span>}
                                                    </div>
                                                    <div className="lesson-duration">{lesson.duration}</div>
                                                </div>
                                                <button 
                                                    className="lesson-start-btn"
                                                    onClick={() => handleLessonClick(lesson)}
                                                >
                                                    {completed ? 'Review' : 'Start'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="modal-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress.percentage}%` }}></div>
                    </div>
                    <p>✓ {progress.completed} out of {progress.total} lessons completed</p>
                </div>
            </div>
        </div>
    );
}

export default ClassModal;