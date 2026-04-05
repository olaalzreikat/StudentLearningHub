import { useState, useEffect } from 'react';
import { tutorsData } from '../data/tutorsData';
import './ClassModal.css';
import './TutorModal.css';
import '../pages/Dashboard.css';
import tutor2 from '../assets/tutor2.jpg';
import tutor3 from '../assets/tutor3.jpg';

function TutorModal({ tutorsData, onClose}) {
    const [showAgendaModal, setShowAgendaModal] = useState(false);
    const [agendaItems, setAgendaItems] = useState([]);
    const [newAgendaItem, setNewAgendaItem] = useState({ 
        title: '', 
        subject: '', 
        date: '', 
        time: '' 
    });
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
            try {
                const savedAgenda = localStorage.getItem('agendaItems');
                if (savedAgenda) {
                    setAgendaItems(JSON.parse(savedAgenda));
                }

            } catch (error) {
                console.error('Error loading progress:', error);
            }
        }, []);

    const showNotificationMessage = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const subjects = [
        { name: 'Algebra', icon: '', color: '#4F46E5' },
        { name: 'Geometry', icon: '', color: '#7C3AED' },
        { name: 'Calculus', icon: '', color: '#DB2777' },
        { name: 'Trigonometry', icon: '', color: '#DC2626' },
        { name: 'Statistics', icon: '', color: '#059669' }
    ];

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                {/* Header */}
                <div className="modal-header">
                    <div className="tutor-image">
                        <img src={tutorsData.specification === 'M' ? tutor3 : tutor2} className='tutor-pfp'></img>
                    </div>
                    <div className="header-info">
                        <h2 className="modal-title">{tutorsData.title}</h2>
                        <p className="modal-description">{tutorsData.description}</p>
                    </div>
                </div>

                <div className="modal-body">
                    { (<div>
                            <div className='tutorModal-description'>
                                <div className='tutorModal-description-section'>
                                    <h2>Bio</h2>
                                    <p>{tutorsData.title} is passionate about helping others not only learn math but love it as well! With their help, you will learn to excel in mathematics while also finding it rewarding and fun.</p>
                                </div>
                                <hr></hr>
                                <div className='tutorModal-description-section'>
                                    <h2>Schedule</h2>
                                    <p>{tutorsData.title} is available:</p>
                                    <p>{tutorsData.availableDays} {tutorsData.availableTimes}</p>
                                </div>
                                <hr></hr>
                                <div className='tutorModal-description-section'>
                                    <h2>Subjects</h2>
                                    <p>{tutorsData.title} specializes in tutoring {tutorsData.subject}</p>
                                </div>
                            </div>
                            <div className="continue-section">
                                <div className="continue-header">
                                    <span className='tutor-book'>Book tutoring session now:</span>
                                </div>
                                <button className="add-book-btn" onClick={() => setShowAgendaModal(true)}>Book</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Agenda Modal */}
                {showAgendaModal && (
                    <div className="modal-overlay" onClick={() => setShowAgendaModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Schedule a Session</h2>
                                <button 
                                    className="modal-close"
                                    onClick={() => setShowAgendaModal(false)}
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

export default TutorModal;