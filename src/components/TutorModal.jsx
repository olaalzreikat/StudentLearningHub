import { useState, useEffect } from 'react';
import { getAgendaKey } from '../utils/localStorage';
import './ClassModal.css';
import './TutorModal.css';
import '../pages/Dashboard.css';
import tutor2 from '../assets/tutor2.jpg';
import tutor3 from '../assets/tutor3.jpg';

function TutorModal({ tutorsData, onClose, onBook, readOnly = false }) {
    const [showAgendaModal, setShowAgendaModal] = useState(false);
    const [agendaItems, setAgendaItems] = useState([]);
    const [newAgendaItem, setNewAgendaItem] = useState({ title: '', subject: '', date: '', time: '' });
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const isRegistered = !!tutorsData.isRegistered;

    useEffect(() => {
        try {
            const savedAgenda = localStorage.getItem(getAgendaKey());
            if (savedAgenda) setAgendaItems(JSON.parse(savedAgenda));
        } catch (error) {
            console.error('Error loading agenda:', error);
        }
    }, []);

    const showNotificationMessage = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const subjects = [
        { name: 'Algebra' },
        { name: 'Geometry' },
        { name: 'Calculus' },
        { name: 'Trigonometry' },
        { name: 'Statistics' },
    ];

    const handleAddAgendaItem = () => {
        if (newAgendaItem.title && newAgendaItem.subject && newAgendaItem.date && newAgendaItem.time) {
            const updatedAgenda = [...agendaItems, newAgendaItem].sort((a, b) =>
                new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
            );
            setAgendaItems(updatedAgenda);
            localStorage.setItem(getAgendaKey(), JSON.stringify(updatedAgenda));
            setNewAgendaItem({ title: '', subject: '', date: '', time: '' });
            setShowAgendaModal(false);
            showNotificationMessage('Session scheduled successfully!');
        }
    };

    const handleBookClick = () => {
        if (isRegistered && onBook) {
            onBook();
        } else {
            setShowAgendaModal(true);
        }
    };

    const bioText = isRegistered
        ? (tutorsData.description || `${tutorsData.title} is available for tutoring sessions.`)
        : `${tutorsData.title} is passionate about helping others not only learn math but love it as well! With their help, you will learn to excel in mathematics while also finding it rewarding and fun.`;

    const scheduleText = isRegistered
        ? (tutorsData.availability || 'Contact for availability')
        : `${tutorsData.availableDays} ${tutorsData.availableTimes}`;

    const subjectsText = isRegistered
        ? tutorsData.subjects?.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
        : tutorsData.subject;

    return (
        <div className="modal-overlay" onClick={onClose} role="presentation">
            <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="tutor-modal-name" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

                <div className="modal-header">
                    <div className="tutor-image">
                        {isRegistered ? (
                            <div className="tutor-avatar-large">
                                {tutorsData.title.charAt(0).toUpperCase()}
                            </div>
                        ) : (
                            <img src={tutorsData.specification === 'M' ? tutor3 : tutor2} className="tutor-pfp" alt={tutorsData.title} />
                        )}
                    </div>
                    <div className="header-info">
                        <h2 className="modal-title" id="tutor-modal-name">{tutorsData.title}</h2>
                        <p className="modal-description">{tutorsData.description}</p>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="tutorModal-description">
                        <div className="tutorModal-description-section">
                            <h2>Bio</h2>
                            <p>{bioText}</p>
                        </div>
                        <hr />
                        <div className="tutorModal-description-section">
                            <h2>Schedule</h2>
                            <p>{tutorsData.title} is available:</p>
                            <p>{scheduleText}</p>
                        </div>
                        <hr />
                        <div className="tutorModal-description-section">
                            <h2>Subjects</h2>
                            <p>{tutorsData.title} specializes in tutoring {subjectsText}</p>
                        </div>
                    </div>

                    {!readOnly && (
                        <div className="continue-section">
                            <div className="continue-header">
                                <span className="tutor-book">Book tutoring session now:</span>
                            </div>
                            <button className="add-book-btn" onClick={handleBookClick}>Book</button>
                        </div>
                    )}
                </div>

                {/* Agenda modal — only for hardcoded tutors */}
                {!isRegistered && showAgendaModal && (
                    <div className="modal-overlay" onClick={() => setShowAgendaModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Schedule a Session</h2>
                                <button className="modal-close" onClick={() => setShowAgendaModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Session Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Algebra Tutoring Session"
                                        value={newAgendaItem.title}
                                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <select
                                        value={newAgendaItem.subject}
                                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, subject: e.target.value })}
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.map(s => (
                                            <option key={s.name} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={newAgendaItem.date}
                                            onChange={(e) => setNewAgendaItem({ ...newAgendaItem, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={newAgendaItem.time}
                                            onChange={(e) => setNewAgendaItem({ ...newAgendaItem, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="cancel-btn" onClick={() => setShowAgendaModal(false)}>Cancel</button>
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

                {showNotification && (
                    <div className="notification" role="status">{notificationMessage}</div>
                )}
            </div>
        </div>
    );
}

export default TutorModal;
