import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subjects } from '../utils/subjectColors';
import './TutorProfile.css';

const PROFILES_KEY = 'tutorProfiles';

function TutorProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState({ name: '', bio: '', subjects: [], availability: '' });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(PROFILES_KEY);
        if (stored) {
            const all = JSON.parse(stored);
            if (all[user?.uid]) setProfile(all[user.uid]);
        }
    }, [user]);

    const handleSave = () => {
        const stored = localStorage.getItem(PROFILES_KEY);
        const all = stored ? JSON.parse(stored) : {};
        all[user.uid] = { ...profile, email: user.email };
        localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const toggleSubject = (subj) => {
        setProfile(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subj)
                ? prev.subjects.filter(s => s !== subj)
                : [...prev.subjects, subj]
        }));
    };

    return (
        <div className="profile-page">
            <div className="profile-page-container">
                <button className="profile-back-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>

                <div className="profile-page-header">
                    <div className="profile-page-avatar">
                        {(profile.name || user?.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="profile-page-title">My Tutor Profile</h1>
                        <p className="profile-page-subtitle">
                            Your profile is shown to students on the Schedule page so they can find and book you.
                        </p>
                    </div>
                </div>

                <div className="profile-page-card">
                    <div className="profile-form-group">
                        <label>Display Name <span className="profile-req">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g., Omar A."
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                        />
                        <span className="profile-field-hint">This is the name students will see</span>
                    </div>

                    <div className="profile-form-group">
                        <label>Bio / About Me</label>
                        <textarea
                            placeholder="Tell students about yourself - your grade, what you're good at, your tutoring style..."
                            value={profile.bio}
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                            rows={5}
                        />
                    </div>

                    <div className="profile-form-group">
                        <label>Subjects I Tutor</label>
                        <div className="profile-subject-grid">
                            {subjects.map(s => (
                                <button
                                    key={s.name}
                                    type="button"
                                    className={`profile-subject-btn ${profile.subjects.includes(s.name.toLowerCase()) ? 'checked' : ''}`}
                                    onClick={() => toggleSubject(s.name.toLowerCase())}
                                >
                                    <span className="psb-icon" style={{ background: s.color }}>{s.icon}</span>
                                    <span className="psb-label">{s.name}</span>
                                    {profile.subjects.includes(s.name.toLowerCase()) && <span className="psb-check">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="profile-form-group">
                        <label>Availability</label>
                        <input
                            type="text"
                            placeholder="e.g., Mon–Fri after 3pm, weekends by appointment"
                            value={profile.availability}
                            onChange={e => setProfile({ ...profile, availability: e.target.value })}
                        />
                    </div>

                    <div className="profile-save-row">
                        <button
                            className={`profile-save-btn ${saved ? 'saved' : ''}`}
                            onClick={handleSave}
                            disabled={!profile.name.trim()}
                        >
                            {saved ? '✓ Profile Saved!' : 'Save Profile'}
                        </button>
                        {profile.name && (
                            <span className="profile-visible-badge">Visible to students on Schedule page</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorProfile;
