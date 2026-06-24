// Schedule page — lets students browse peer tutors and group study sessions, and book / join them
import { useState, useEffect } from "react";
import {
  videosData,
  quizzesData,
  problemsData,
  guidesData,
} from "../data/resourcesData";
import { classesData } from "../data/classesData";
import { tutorsData } from "../data/tutorsData";
import { groupSessionData } from "../data/groupSessionData";
import { lessonsData } from "../data/lessonsData";
import { getSubjectColor } from "../utils/subjectColors";
import {
  getProgress,
  markAsComplete,
  addActivity,
  checkAndAwardAchievements,
  getAgendaKey,
} from "../utils/localStorage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import TutorModal from "../components/TutorModal";
import tutor2 from "../assets/tutor2.jpg";
import tutor3 from "../assets/tutor3.jpg";
import "./Resources.css";
import "./Schedule.css";

function Schedule() {
  // Filter/search state
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [videoFilter, setVideoFilter] = useState("all");
  const [guideFilter, setGuideFilter] = useState("all");

  // Show more toggles for tutors and sessions lists
  const [showAllTutors, setShowAllTutors] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);

  // Tutor modal
  const [selectedClass, setSelectedClass] = useState(null);
  const [classProgress, setClassProgress] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sessions the user has joined, and live participant counts
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [sessionCounts, setSessionCounts] = useState({});
  const [tutorSessions, setTutorSessions] = useState([]);
  const [registeredTutors, setRegisteredTutors] = useState([]);

  const { user, role } = useAuth();

  // Separate burst animation states for tutors vs group sessions
  const [tutorBurstId, setTutorBurstId] = useState(null);
  const [sessionBurstId, setSessionBurstId] = useState(null);

  // 1-on-1 request modal
  const [requestModal, setRequestModal] = useState(null); // tutor object or null
  const [requestForm, setRequestForm] = useState({ subject: '', message: '', date: '', time: '' });

  // Toast notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const navigate = useNavigate();

  // Fires the star burst on the tutor button that was clicked
  const triggerTutorBurst = (id) => {
    setTutorBurstId(id);
    setTimeout(() => setTutorBurstId(null), 900);
  };

  // Fires the star burst on the session button that was clicked
  const triggerSessionBurst = (id) => {
    setSessionBurstId(id);
    setTimeout(() => setSessionBurstId(null), 900);
  };

  const getTopicColor = getSubjectColor;

  const progress = getProgress();

  useEffect(() => {
    // Load joined sessions from localStorage (per-user)
    const savedAgenda = localStorage.getItem(getAgendaKey());
    if (savedAgenda) {
      const agendaItems = JSON.parse(savedAgenda);
      const groupSessionIds = agendaItems
        .filter(item => item.type === 'group')
        .map(item => item.groupId);
      setJoinedSessions(groupSessionIds);
    }

    // Load session counts from localStorage
    const savedCounts = localStorage.getItem('groupSessionCounts');
    if (savedCounts) {
      setSessionCounts(JSON.parse(savedCounts));
    } else {
      const initialCounts = {};
      groupSessionData.forEach(session => {
        initialCounts[session.id] = session.currentSize;
      });
      setSessionCounts(initialCounts);
      localStorage.setItem('groupSessionCounts', JSON.stringify(initialCounts));
    }

    // Load tutor-posted sessions (upcoming only)
    const savedTutorSessions = localStorage.getItem('tutorPostedSessions');
    if (savedTutorSessions) {
      const all = JSON.parse(savedTutorSessions);
      setTutorSessions(all.filter(s => new Date(`${s.date}T${s.time}`) >= new Date()));
    }

    // Load registered tutor profiles (include uid from key)
    const savedProfiles = localStorage.getItem('tutorProfiles');
    if (savedProfiles) {
      const profilesMap = JSON.parse(savedProfiles);
      setRegisteredTutors(
        Object.entries(profilesMap)
          .filter(([, p]) => p.name)
          .map(([uid, p]) => ({ ...p, uid }))
      );
    }

  }, [refreshTrigger]);

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
  };

  const handleModalClose = () => {
    setSelectedClass(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLessonStart = (lesson) => {
    const fullLesson = lessonsData.find((l) => l.id === lesson.id);

    if (fullLesson) {
      localStorage.setItem("currentLesson", JSON.stringify(fullLesson));
    } else {
      // Fallback lesson data
      const fallbackLessonData = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || `Learn about ${lesson.title}`,
        topic: selectedClass?.subject || "mathematics",
        difficulty: selectedClass?.level?.toLowerCase() || "intermediate",
        duration: lesson.duration,
        content: {
          introduction:
            lesson.description ||
            `Welcome to ${lesson.title}. In this lesson, you'll master essential concepts.`,
          keyPoints: [
            `Understanding ${lesson.title.toLowerCase()}`,
            "Step-by-step problem solving techniques",
            "Common applications and examples",
            "Practice exercises to build mastery",
          ],
          examples: [
            {
              problem: `Example problem for ${lesson.title}`,
              solution: "Step-by-step solution with explanation",
              steps: [
                "Identify the problem",
                "Apply the appropriate method",
                "Solve step by step",
                "Verify the solution",
              ],
            },
            {
              problem: `Practice problem for ${lesson.title}`,
              solution: "Detailed walkthrough of the solution",
              steps: [
                "Read the problem carefully",
                "Choose your approach",
                "Work through each step",
                "Check your answer",
              ],
            },
          ],
        },
      };

      localStorage.setItem("currentLesson", JSON.stringify(fallbackLessonData));
    }

    window.open("/lesson", "_blank");

    // Refresh progress after lesson window is opened
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 1000);
  };

  const handleJoinGroupSession = (group) => {
    // Check if already joined
    if (joinedSessions.includes(group.id)) {
      showNotificationMessage(' You have already joined this session!');
      return;
    }

    // Get current count for this session
    const currentCount = sessionCounts[group.id] || group.currentSize;

    // Check if session is full
    if (currentCount >= group.totalSize) {
      showNotificationMessage(' This session is full!');
      return;
    }

    // Get existing agenda items
    const savedAgenda = localStorage.getItem(getAgendaKey());
    const agendaItems = savedAgenda ? JSON.parse(savedAgenda) : [];
    
    // Create session item from group data
    const sessionItem = {
      title: `${group.subject} with ${group.title}`,
      subject: group.topic.charAt(0).toUpperCase() + group.topic.slice(1),
      date: group.date,
      time: group.time,
      type: 'group',
      groupId: group.id,
      instructor: group.instructor || group.title
    };
    
    // Add to agenda and sort by date/time
    const updatedAgenda = [...agendaItems, sessionItem].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    localStorage.setItem(getAgendaKey(), JSON.stringify(updatedAgenda));
    
    // Update joined sessions state
    setJoinedSessions([...joinedSessions, group.id]);
    
    // Increment session count
    const updatedCounts = {
      ...sessionCounts,
      [group.id]: currentCount + 1
    };
    setSessionCounts(updatedCounts);
    localStorage.setItem('groupSessionCounts', JSON.stringify(updatedCounts));
    
    // Save student to session roster
    if (user?.email) {
      const savedRosters = localStorage.getItem('sessionRosters');
      const rosters = savedRosters ? JSON.parse(savedRosters) : {};
      rosters[group.id] = [...(rosters[group.id] || []), { email: user.email, joinedAt: new Date().toISOString() }];
      localStorage.setItem('sessionRosters', JSON.stringify(rosters));
    }

    // Show success message
    showNotificationMessage(`Successfully joined "${group.subject}" with ${group.title}!`);
    
    // Trigger refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancelGroupSession = (group) => {
    // Get existing agenda items
    const savedAgenda = localStorage.getItem(getAgendaKey());
    const agendaItems = savedAgenda ? JSON.parse(savedAgenda) : [];
    
    // Remove the session
    const updatedAgenda = agendaItems.filter(item => 
      !(item.type === 'group' && item.groupId === group.id)
    );
    
    localStorage.setItem(getAgendaKey(), JSON.stringify(updatedAgenda));
    
    // Update joined sessions state
    setJoinedSessions(joinedSessions.filter(id => id !== group.id));
    
    // Decrement session count
    const currentCount = sessionCounts[group.id] || group.currentSize;
    const updatedCounts = {
      ...sessionCounts,
      [group.id]: Math.max(0, currentCount - 1) // Don't go below 0
    };
    setSessionCounts(updatedCounts);
    localStorage.setItem('groupSessionCounts', JSON.stringify(updatedCounts));
    
    // Show message
    showNotificationMessage(` Cancelled "${group.subject}" session with ${group.title}`);
    
    // Trigger refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSendRequest = () => {
    if (!requestForm.subject || !requestForm.date || !requestForm.time) return;
    const req = {
      id: `req-${Date.now()}`,
      tutorId: requestModal.uid,
      tutorEmail: requestModal.email,
      tutorName: requestModal.title || requestModal.name,
      studentEmail: user?.email || 'Anonymous',
      studentId: user?.uid || '',
      subject: requestForm.subject,
      message: requestForm.message,
      preferredDate: requestForm.date,
      preferredTime: requestForm.time,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    const saved = localStorage.getItem('oneOnOneRequests');
    const all = saved ? JSON.parse(saved) : [];
    all.push(req);
    localStorage.setItem('oneOnOneRequests', JSON.stringify(all));
    setRequestModal(null);
    setRequestForm({ subject: '', message: '', date: '', time: '' });
    showNotificationMessage(`Request sent to ${requestModal.title || requestModal.name}!`);
  };

  // Filter functions
  const getFilteredData = () => {
    // Merge registered tutors (with isRegistered flag) into tutors list
    const regTutors = registeredTutors.map(p => ({
      id: `reg-${p.uid}`,
      title: p.name,
      topic: p.subjects?.[0] || 'algebra',
      subjects: p.subjects || [],
      description: p.bio || '',
      availability: p.availability || '',
      availableDays: p.availability || '',
      availableTimes: '',
      email: p.email,
      uid: p.uid,
      isRegistered: true,
    }));
    let tutors = [...regTutors, ...tutorsData];

    // Tutor-posted sessions first (newest first), then hardcoded
    let groupSessions = [...[...tutorSessions].reverse(), ...groupSessionData];
    let videos = videosData;
    let quizzes = quizzesData;
    let problems = problemsData;
    let guides = guidesData;

    // Apply category filter
    if (activeFilter !== "all") {
      tutors = tutors.filter((t) =>
        t.isRegistered
          ? t.subjects.includes(activeFilter)
          : t.topic.toLowerCase() === activeFilter
      );
      videos = videos.filter(
        (v) => v.topic && v.topic.toLowerCase() === activeFilter
      );
      quizzes = quizzes.filter((q) => q.topic.toLowerCase() === activeFilter);
      problems = problems.filter((p) => p.topic.toLowerCase() === activeFilter);
      guides = guides.filter((g) => g.topic.toLowerCase() === activeFilter);
      groupSessions = groupSessions.filter((g)=>g.topic.toLowerCase() === activeFilter);
    }

    // Apply video class filter
    if (videoFilter !== "all") {
      videos = videos.filter((v) => v.class === videoFilter);
    }

    // Apply guide topic filter
    if (guideFilter !== "all") {
      groupSessions = groupSessions.filter((g) => g.topic.toLowerCase() === guideFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tutors = tutors.filter((t) =>
        t.isRegistered
          ? t.title.toLowerCase().includes(query) || t.subjects.some(s => s.includes(query)) || t.description.toLowerCase().includes(query)
          : t.topic.toLowerCase().includes(query)
      );
      groupSessions = groupSessions.filter((g) => 
        g.title.toLowerCase().includes(query) || 
        g.subject.toLowerCase().includes(query)
      );
    }

    return { tutors, groupSessions };
  };

  const filtered = getFilteredData();
  const hasResults = filtered.tutors.length > 0 || filtered.groupSessions.length > 0;

  return (
    <div className="resources-page">
      {/* Notification aria-live announces it to screen readers automatically */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {showNotification && (
          <div className="notification">
            {notificationMessage}
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="schedule-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Book a Session</h1>
            <p>Find the right help and book a session that fits your schedule</p>
          </div>
        </div>
      </div>

      {/* Tutor CTA Banner */}
      {role === 'tutor' && (
        <div className="tutor-schedule-banner">
          <div className="tutor-schedule-banner-inner">
            <div className="tsb-left">
              <span className="tsb-pill">Tutor View</span>
              <div>
                <p className="tsb-title">Your posted sessions appear at the top of this page</p>
                <p className="tsb-sub">Students can join them directly from here.</p>
              </div>
            </div>
            <button className="tsb-post-btn" onClick={() => navigate('/dashboard')}>
              + Post New Session
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="resources-container">
        {/* Filter Bar */}
        <div className="category-filter-bar">
          <div className="category-buttons">
            <button
              className={`category-btn ${
                activeFilter === "all" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`category-btn ${
                activeFilter === "algebra" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("algebra")}
            >
              Algebra
            </button>
            <button
              className={`category-btn ${
                activeFilter === "geometry" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("geometry")}
            >
              Geometry
            </button>
            <button
              className={`category-btn ${
                activeFilter === "calculus" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("calculus")}
            >
              Calculus
            </button>
            <button
              className={`category-btn ${
                activeFilter === "statistics" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("statistics")}
            >
              Statistics
            </button>
            <button
              className={`category-btn ${
                activeFilter === "trigonometry" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("trigonometry")}
            >
              Trigonometry
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search tutors or sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* No Results */}
        {!hasResults && (
          <div className="no-resources">
            No sessions found. Try a different subject or clear your filters.
          </div>
        )}

        {/* TUTORS SECTION — registered + hardcoded merged */}
        {filtered.tutors.length > 0 && (
          <div className="resource-section">
            <div className="section-header">
              <h2>Peer Tutors</h2>
            </div>
            <div className="tutor-list-grid">
              {(showAllTutors ? filtered.tutors : filtered.tutors.slice(0, 4)).map((classItem) => (
                <div
                  key={classItem.id}
                  className={`tutor-list-card ${classItem.isRegistered ? 'registered-tutor-card' : ''}`}
                  onClick={() => {
                    if (classItem.isRegistered && !user) { navigate('/login'); return; }
                    handleClassClick(classItem);
                  }}
                >
                  {classItem.isRegistered ? (
                    <div className="tutor-list-avatar">
                      {classItem.title.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <img
                      className="tutor-list-photo"
                      src={classItem.specification === 'M' ? tutor3 : tutor2}
                      alt={classItem.title}
                    />
                  )}
                  <div className="tutor-list-info">
                    <div className="tutor-list-top">
                      <h3 className="tutor-list-name">{classItem.title}</h3>
                      <span className="tutor-list-badge" style={{ background: getTopicColor(classItem.topic) + '18', color: getTopicColor(classItem.topic) }}>
                        {classItem.isRegistered
                          ? (classItem.subjects[0] || classItem.topic)
                          : classItem.topic.split(' ')[0]}
                      </span>
                    </div>
                    {classItem.isRegistered ? (
                      <>
                        {classItem.subjects.length > 1 && (
                          <p className="tutor-list-meta">{classItem.subjects.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · ')}</p>
                        )}
                        <p className="tutor-list-desc">{classItem.description || 'Available for tutoring sessions.'}</p>
                        {classItem.availability && (
                          <p className="tutor-list-avail"><span className="avail-label">Available:</span> {classItem.availability}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="tutor-list-meta">Year {classItem.year} · {classItem.subject} Lessons</p>
                        <p className="tutor-list-desc">{classItem.description}</p>
                        <p className="tutor-list-avail">
                          <span className="avail-label">Available:</span> {classItem.availableDays} · {classItem.availableTimes}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="tutor-list-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="btn-burst-wrapper">
                      <button
                        className="tutor-list-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (classItem.isRegistered && !user) { navigate('/login'); return; }
                          triggerTutorBurst(classItem.id);
                          handleClassClick(classItem);
                        }}
                      >
                        Book Session
                      </button>
                      {tutorBurstId === classItem.id && [1,2,3,4,5,6,7,8].map((i) => (
                        <span key={i} className={`burst-star bs${i}`}></span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtered.tutors.length > 4 && (
              <button className="show-more-btn" onClick={() => setShowAllTutors(prev => !prev)}>
                {showAllTutors ? 'Show less ↑' : 'Show all tutors ↓'}
              </button>
            )}
          </div>
        )}

        {/* GROUP SESSIONS SECTION */}
        {filtered.groupSessions.length > 0 && (
          <div className="resource-section">
            <div className="section-header">
              <h2>Group Study Sessions</h2>
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
                <option value="trigonometry">Trigonometry</option>
              </select>
            </div>
            <div className="downloads-grid">
              {(showAllSessions ? filtered.groupSessions : filtered.groupSessions.slice(0, 6)).map((group) => {
                const isJoined = joinedSessions.includes(group.id);
                const currentCount = sessionCounts[group.id] !== undefined 
                  ? sessionCounts[group.id] 
                  : group.currentSize;
                const isFull = currentCount >= group.totalSize;
                
                const spotsLeft = group.totalSize - currentCount;

                return (
                  <div key={group.id} className="group-session-card" style={{ '--accent': getTopicColor(group.topic) }}>
                    <div className="gsc-top">
                      <div className="gsc-avatar" style={{ background: getTopicColor(group.topic) }}>
                        {group.title.charAt(0)}
                      </div>
                      <div className="gsc-header">
                        <h4 className="gsc-name">{group.title}</h4>
                        <p className="gsc-subject">{group.subject}</p>
                      </div>
                      <span className="gsc-topic-badge" style={{ background: getTopicColor(group.topic) + '18', color: getTopicColor(group.topic) }}>
                        {group.topic.split(' ')[0]}
                      </span>
                    </div>

                    <div className="gsc-pills">
                      <span className="gsc-pill">{new Date(group.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>

                    <p className="gsc-desc">{group.description.split(',').slice(1).join(',').trim()}</p>

                    <div className="gsc-spots">
                      <div className="gsc-spots-row">
                        <span className="gsc-spots-text">{currentCount} / {group.totalSize} students</span>
                        {!isFull && <span className="gsc-spots-left" style={{ color: getTopicColor(group.topic) }}>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>}
                        {isFull && <span className="gsc-spots-full">Full</span>}
                      </div>
                      <div className="session-progress">
                        <div className="session-progress-bar" style={{ width: `${(currentCount / group.totalSize) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="btn-burst-wrapper">
                      {isJoined ? (
                        <button className="gsc-btn gsc-btn-cancel" onClick={() => handleCancelGroupSession(group)}>
                          Cancel Registration
                        </button>
                      ) : (
                        <button
                          className={`gsc-btn ${isFull ? 'gsc-btn-full' : 'gsc-btn-join'}`}
                          style={{}}
                          onClick={() => { handleJoinGroupSession(group); if (!isFull) triggerSessionBurst(group.id); }}
                          disabled={isFull}
                        >
                          {isFull ? 'Session Full' : 'Join Session'}
                        </button>
                      )}
                      {sessionBurstId === group.id && [1,2,3,4,5,6,7,8].map((i) => (
                        <span key={i} className={`burst-star bs${i}`}></span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {filtered.groupSessions.length > 6 && (
              <button className="show-more-btn" onClick={() => setShowAllSessions(prev => !prev)}>
                {showAllSessions ? 'Show less ↑' : 'Show all sessions ↓'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Class Modal */}
      {selectedClass && (
        <TutorModal
          tutorsData={selectedClass}
          onClose={handleModalClose}
          onBook={selectedClass.isRegistered ? () => {
            setSelectedClass(null);
            setRequestModal(selectedClass);
          } : undefined}
        />
      )}

      {/* 1-on-1 Request Modal */}
      {requestModal && (
        <div className="modal-overlay" onClick={() => setRequestModal(null)} role="presentation">
          <div className="modal-content wide-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="request-modal-title">Book a Session with {requestModal.title || requestModal.name}</h2>
              <button className="modal-close" onClick={() => setRequestModal(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div className="request-tutor-preview">
                <div className="request-tutor-avatar">{requestModal.title.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="request-tutor-name">{requestModal.title}</div>
                  {requestModal.availability && (
                    <div className="request-tutor-avail">Available: {requestModal.availability}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Subject <span className="req">*</span></label>
                <select value={requestForm.subject} onChange={e => setRequestForm({ ...requestForm, subject: e.target.value })}>
                  <option value="">Select subject</option>
                  {(requestModal.subjects?.length ? requestModal.subjects : ['algebra', 'geometry', 'calculus', 'statistics', 'trigonometry']).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date <span className="req">*</span></label>
                  <input type="date" value={requestForm.date} min={new Date().toISOString().split('T')[0]}
                    onChange={e => setRequestForm({ ...requestForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Preferred Time <span className="req">*</span></label>
                  <input type="time" value={requestForm.time}
                    onChange={e => setRequestForm({ ...requestForm, time: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Message <span className="optional-label">(optional)</span></label>
                <textarea rows={3} placeholder="Tell the tutor what topics you need help with..."
                  value={requestForm.message}
                  onChange={e => setRequestForm({ ...requestForm, message: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setRequestModal(null)}>Cancel</button>
              <button className="submit-btn"
                onClick={handleSendRequest}
                disabled={!requestForm.subject || !requestForm.date || !requestForm.time}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
