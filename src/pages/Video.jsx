import { useState, useEffect } from 'react';
import { addActivity, checkAndAwardAchievements, getProgress, saveProgress } from '../utils/localStorage';
import { videosData, problemsData } from '../data/resourcesData';
import styles from './Video.module.css';

function Video() {
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Notes feature
    const [notes, setNotes] = useState('');
    const [discussions, setDiscussions] = useState([]);
    const [newDiscussion, setNewDiscussion] = useState('');
    const [userName, setUserName] = useState('');
    
    // Reply feature
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyName, setReplyName] = useState('');

    useEffect(() => {
        const videoData = localStorage.getItem('currentVideo');
        if (videoData) {
            const video = JSON.parse(videoData);
            setCurrentVideo(video);

            const progress = getProgress();
            if (progress.completedVideos && progress.completedVideos.includes(video.id)) {
                setIsCompleted(true);
            }

            // Get related videos
            const related = videosData
                .filter(v => v.id !== video.id && v.class === video.class)
                .slice(0, 6);
            setRelatedVideos(related);

            // Load discussions
            const savedDiscussions = localStorage.getItem(`discussions-${video.id}`);
            if (savedDiscussions) {
                setDiscussions(JSON.parse(savedDiscussions));
            }

            // Load notes
            const savedNotes = localStorage.getItem(`notes-video-${video.id}`);
            if (savedNotes) setNotes(savedNotes);
        }
    }, []);

    const markComplete = () => {
        if (isCompleted || !currentVideo) return;

        const progress = getProgress();
        if (!progress.completedVideos) {
            progress.completedVideos = [];
        }
        
        if (!progress.completedVideos.includes(currentVideo.id)) {
            progress.completedVideos.push(currentVideo.id);
            saveProgress(progress);
            addActivity('video', currentVideo.title, currentVideo.topic);
            checkAndAwardAchievements();
        }

        setIsCompleted(true);
        alert('✓ Video marked as complete! Close this tab to return to resources.');
    };

    const saveNotes = () => {
        if (currentVideo) {
            localStorage.setItem(`notes-video-${currentVideo.id}`, notes);
            alert('✓ Notes saved!');
        }
    };

    const handleSubmitDiscussion = () => {
        if (!newDiscussion.trim() || !userName.trim()) {
            alert('Please enter your name and a message!');
            return;
        }

        const newComment = {
            id: Date.now(),
            userName: userName,
            message: newDiscussion,
            timestamp: new Date().toISOString(),
            likes: 0,
            replies: []
        };

        const updatedDiscussions = [newComment, ...discussions];
        setDiscussions(updatedDiscussions);
        localStorage.setItem(`discussions-${currentVideo.id}`, JSON.stringify(updatedDiscussions));
        
        setNewDiscussion('');
        alert('Discussion posted successfully!');
    };

    const handleSubmitReply = (discussionId) => {
        if (!replyText.trim() || !replyName.trim()) {
            alert('Please enter your name and a reply!');
            return;
        }

        const newReply = {
            id: Date.now(),
            userName: replyName,
            message: replyText,
            timestamp: new Date().toISOString(),
            likes: 0
        };

        const updatedDiscussions = discussions.map(disc => {
            if (disc.id === discussionId) {
                return {
                    ...disc,
                    replies: [...(disc.replies || []), newReply]
                };
            }
            return disc;
        });

        setDiscussions(updatedDiscussions);
        localStorage.setItem(`discussions-${currentVideo.id}`, JSON.stringify(updatedDiscussions));
        
        setReplyText('');
        setReplyName('');
        setReplyingTo(null);
        alert('Reply posted successfully!');
    };

    const handleLikeDiscussion = (discussionId) => {
        const updatedDiscussions = discussions.map(disc => 
            disc.id === discussionId ? { ...disc, likes: disc.likes + 1 } : disc
        );
        setDiscussions(updatedDiscussions);
        localStorage.setItem(`discussions-${currentVideo.id}`, JSON.stringify(updatedDiscussions));
    };

    const handleLikeReply = (discussionId, replyId) => {
        const updatedDiscussions = discussions.map(disc => {
            if (disc.id === discussionId) {
                return {
                    ...disc,
                    replies: disc.replies.map(reply =>
                        reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
                    )
                };
            }
            return disc;
        });
        setDiscussions(updatedDiscussions);
        localStorage.setItem(`discussions-${currentVideo.id}`, JSON.stringify(updatedDiscussions));
    };

    const handleRelatedVideoClick = (video) => {
        localStorage.setItem('currentVideo', JSON.stringify(video));
        window.location.reload();
    };

    const openPracticeProblems = (difficulty) => {
        const topic = currentVideo.topic || currentVideo.class;
        // Find a problem set matching topic and difficulty, fall back to topic only
        const problemSet =
            problemsData.find(p => p.topic === topic && p.difficulty === difficulty) ||
            problemsData.find(p => p.topic === topic) ||
            problemsData.find(p => p.difficulty === difficulty) ||
            problemsData[0];
        localStorage.setItem('currentProblemSet', JSON.stringify(problemSet));
        window.open('/problems', '_blank');
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (!currentVideo) {
        return (
            <div className={styles.videoPage}>
                <button className={styles.closeTabBtn} onClick={() => window.close()}>
                    ✕ Close Tab
                </button>
                <div className="container">
                    <h2>Video Not Found</h2>
                    <p>Unable to load video data. Please return to the resources page and try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.videoPage}>
            <button className={styles.closeTabBtn} onClick={() => window.close()}>
                ✕ Close Tab
            </button>

            <div className={styles.videoWrapper}>
                {/* HEADER SECTION */}
                <div className={styles.videoHeader}>
                    <div className={styles.headerContent}>
                        <span className={styles.unitLabel}>
                            {currentVideo.class?.toUpperCase() || 'MATHEMATICS'} • VIDEO LESSON
                        </span>
                        
                        <h1 className={styles.videoTitle}>{currentVideo.title}</h1>
                        <p className={styles.videoObjective}>{currentVideo.description}</p>
                        
                       
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className={styles.videoLayout}>
                    {/* LEFT COLUMN */}
                    <div className={styles.videoMainContent}>
                        {/* Video Player */}
                        <div className={styles.videoPlayerBox}>
                            <iframe
                                src={currentVideo.videoUrl}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={currentVideo.title}
                                className={styles.videoPlayer}
                            />
                        </div>

                        

                        {/* TABS */}
                        <div className={styles.tabsContainer}>
                            <div className={styles.tabsHeader}>
                                <button 
                                    className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Overview
                                </button>
                                <button 
                                    className={`${styles.tabBtn} ${activeTab === 'notes' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('notes')}
                                >
                                    Notes
                                </button>
                                <button 
                                    className={`${styles.tabBtn} ${activeTab === 'practice' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('practice')}
                                >
                                    Practice
                                </button>
                                <button 
                                    className={`${styles.tabBtn} ${activeTab === 'discussions' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('discussions')}
                                >
                                    Discussions
                                </button>
                            </div>

                            <div className={styles.tabContent}>
                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <div className={styles.tabPane}>
                                        <div className={styles.aboutSection}>
                                            <h3>About This Video</h3>
                                            <p>
                                                Welcome to this comprehensive video on {currentVideo.title}. In this session, we'll dive deep into the fundamentals 
                                                and advanced concepts that will help you master this topic.
                                            </p>
                                            <p>
                                                You'll gain a solid foundation that will serve you well in your mathematical journey. The concepts covered here are 
                                                essential building blocks for more advanced topics in {currentVideo.class}.
                                            </p>
                                        </div>

                                       

                                        <div className={styles.detailsSection}>
                                            <h3>Video Details</h3>
                                            <div className={styles.detailGrid}>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Duration</span>
                                                    <span className={styles.detailValue}>{currentVideo.duration}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Level</span>
                                                    <span className={styles.detailValue}>{currentVideo.level || 'Intermediate'}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Views</span>
                                                    <span className={styles.detailValue}>{currentVideo.views || '12,620'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* NOTES TAB */}
                                {activeTab === 'notes' && (
                                    <div className={styles.tabPane}>
                                        <div className={styles.notesSection}>
                                            <h3>Your Notes</h3>
                                            <p>Take notes while watching the video to help you remember key concepts.</p>
                                            <textarea
                                                className={styles.notesTextarea}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Write your notes here..."
                                                rows="12"
                                            />
                                            <button className={styles.saveNotesBtn} onClick={saveNotes}>
                                                Save Notes
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* PRACTICE TAB */}
                                {activeTab === 'practice' && (
                                    <div className={styles.tabPane}>
                                        <div className={styles.practiceSection}>
                                            <h3> Practice Problems</h3>
                                            <p>Test your understanding with practice problems related to {currentVideo.title}.</p>
                                            
                                            <div className={styles.practiceGrid}>
                                                <div className={styles.practiceCard}>
                                                    <div className={styles.practiceHeader}>
                                                        <h4>Beginner Level</h4>
                                                    </div>
                                                    <p>Build your confidence with fundamental problems.</p>
                                                    <button className={styles.practiceBtn} onClick={() => openPracticeProblems('beginner')}>
                                                        Start Practicing →
                                                    </button>
                                                </div>

                                                <div className={styles.practiceCard}>
                                                    <div className={styles.practiceHeader}>
                                                        <h4>Intermediate Level</h4>
                                                    </div>
                                                    <p>Challenge yourself with complex variations.</p>
                                                    <button className={styles.practiceBtn} onClick={() => openPracticeProblems('intermediate')}>
                                                        Start Practicing →
                                                    </button>
                                                </div>

                                                <div className={styles.practiceCard}>
                                                    <div className={styles.practiceHeader}>
                                                        <h4>Advanced Level</h4>
                                                    </div>
                                                    <p>Master the topic with advanced problems.</p>
                                                    <button className={styles.practiceBtn} onClick={() => openPracticeProblems('advanced')}>
                                                        Start Practicing →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* DISCUSSIONS TAB */}
                                {activeTab === 'discussions' && (
                                    <div className={styles.tabPane}>
                                        <div className={styles.discussionsSection}>
                                            <h3> Discussions</h3>
                                            
                                            <div className={styles.discussionForm}>
                                                <input
                                                    type="text"
                                                    className={styles.discussionInput}
                                                    placeholder="Your name"
                                                    value={userName}
                                                    onChange={(e) => setUserName(e.target.value)}
                                                />
                                                <textarea
                                                    className={styles.discussionTextarea}
                                                    placeholder="Ask a question or share your thoughts..."
                                                    value={newDiscussion}
                                                    onChange={(e) => setNewDiscussion(e.target.value)}
                                                    rows="4"
                                                />
                                                <button className={styles.postBtn} onClick={handleSubmitDiscussion}>
                                                    Post Discussion
                                                </button>
                                            </div>

                                            <div className={styles.discussionsList}>
                                                {discussions.length === 0 ? (
                                                    <div className={styles.noDiscussions}>
                                                        <p>No discussions yet. Be the first to start one!</p>
                                                    </div>
                                                ) : (
                                                    discussions.map((disc) => (
                                                        <div key={disc.id} className={styles.discussionThread}>
                                                            {/* Main Discussion */}
                                                            <div className={styles.discussionCard}>
                                                                <div className={styles.discussionAvatar}>
                                                                    {disc.userName.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className={styles.discussionContent}>
                                                                    <div className={styles.discussionHeader}>
                                                                        <span className={styles.discussionAuthor}>{disc.userName}</span>
                                                                        <span className={styles.discussionTime}>{formatTimestamp(disc.timestamp)}</span>
                                                                    </div>
                                                                    <p className={styles.discussionMessage}>{disc.message}</p>
                                                                    <div className={styles.discussionActions}>
                                                                        <button 
                                                                            className={styles.likeButton}
                                                                            onClick={() => handleLikeDiscussion(disc.id)}
                                                                        >
                                                                             like{disc.likes > 0 && <span>{disc.likes}</span>}
                                                                        </button>
                                                                        <button 
                                                                            className={styles.replyButton}
                                                                            onClick={() => setReplyingTo(replyingTo === disc.id ? null : disc.id)}
                                                                        >
                                                                             Reply {disc.replies?.length > 0 && `(${disc.replies.length})`}
                                                                        </button>
                                                                    </div>

                                                                    {/* Reply Form */}
                                                                    {replyingTo === disc.id && (
                                                                        <div className={styles.replyForm}>
                                                                            <input
                                                                                type="text"
                                                                                className={styles.replyInput}
                                                                                placeholder="Your name"
                                                                                value={replyName}
                                                                                onChange={(e) => setReplyName(e.target.value)}
                                                                            />
                                                                            <textarea
                                                                                className={styles.replyTextarea}
                                                                                placeholder="Write your reply..."
                                                                                value={replyText}
                                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                                rows="3"
                                                                            />
                                                                            <div className={styles.replyFormActions}>
                                                                                <button 
                                                                                    className={styles.replySubmitBtn}
                                                                                    onClick={() => handleSubmitReply(disc.id)}
                                                                                >
                                                                                    Post Reply
                                                                                </button>
                                                                                <button 
                                                                                    className={styles.replyCancelBtn}
                                                                                    onClick={() => {
                                                                                        setReplyingTo(null);
                                                                                        setReplyText('');
                                                                                        setReplyName('');
                                                                                    }}
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Replies */}
                                                            {disc.replies && disc.replies.length > 0 && (
                                                                <div className={styles.repliesList}>
                                                                    {disc.replies.map((reply) => (
                                                                        <div key={reply.id} className={styles.replyCard}>
                                                                            <div className={styles.replyAvatar}>
                                                                                {reply.userName.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div className={styles.replyContent}>
                                                                                <div className={styles.replyHeader}>
                                                                                    <span className={styles.replyAuthor}>{reply.userName}</span>
                                                                                    <span className={styles.replyTime}>{formatTimestamp(reply.timestamp)}</span>
                                                                                </div>
                                                                                <p className={styles.replyMessage}>{reply.message}</p>
                                                                                <button 
                                                                                    className={styles.likeReplyButton}
                                                                                    onClick={() => handleLikeReply(disc.id, reply.id)}
                                                                                >
                                                                                    like {reply.likes > 0 && <span>{reply.likes}</span>}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className={styles.videoSidebar}>
                        {/* Course Card */}
                        <div className={styles.courseCard}>
                            <button 
                                className={`${styles.btnComplete} ${isCompleted ? styles.completed : ''}`}
                                onClick={markComplete}
                                disabled={isCompleted}
                            >
                                {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                            </button>
                        
                        </div>

                        {/* Related Videos */}
                        <div className={styles.relatedSection}>
                            <h3>More from {currentVideo.class}</h3>
                            <div className={styles.relatedList}>
                                {relatedVideos.map(video => {
                                    const isVideoCompleted = getProgress().completedVideos?.includes(video.id);
                                    return (
                                        <div 
                                            key={video.id}
                                            className={styles.relatedCard}
                                            onClick={() => handleRelatedVideoClick(video)}
                                        >
                                            <div className={styles.relatedThumb}>
                                                <iframe
                                                    src={video.videoUrl}
                                                    title={video.title}
                                                    style={{ pointerEvents: 'none' }}
                                                />
                                                {isVideoCompleted && <div className={styles.completedBadge}>✓</div>}
                                            </div>
                                            <div className={styles.relatedInfo}>
                                                <h4>{video.title}</h4>
                                                <span>{video.duration}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Video;
