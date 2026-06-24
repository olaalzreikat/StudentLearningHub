import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tutorsData } from '../data/tutorsData';
import './Tutors.css';

const SUBJECTS = ['All', 'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'];
const GRADES = ['All', '11', '12'];
const DAYS = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Mock baseline ratings (real ratings from localStorage will overlay these)
const baseRatings = {
    'algebra-1': { avg: 4.8, count: 23 }, 'algebra-1-2': { avg: 4.9, count: 31 },
    'algebra-2': { avg: 4.7, count: 18 }, 'algebra-2-honors': { avg: 4.6, count: 14 },
    'algebra-2-geometry': { avg: 5.0, count: 9 }, 'geometry': { avg: 4.8, count: 27 },
    'precalculus': { avg: 4.9, count: 22 }, 'precalculus-statistics': { avg: 4.7, count: 17 },
    'calculus-ab': { avg: 4.8, count: 35 }, 'statistics': { avg: 4.9, count: 20 },
    'trigonometry': { avg: 4.6, count: 11 }, 'trigonometry-calculus': { avg: 4.9, count: 28 },
};

const avatarColors = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

function Stars({ rating }) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
        <span className="stars-row" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={
                    i <= full ? 'star filled' :
                    i === full + 1 && half ? 'star half' : 'star'
                }>★</span>
            ))}
        </span>
    );
}

function TutorCard({ tutor, rating }) {
    const initials = tutor.title.split(' ').map(w => w[0]).join('');
    const color = avatarColors[tutor.id.length % avatarColors.length];

    return (
        <div className="tutor-dir-card">
            <div className="tutor-dir-avatar" style={{ background: color + '1a', color }}>
                {initials}
            </div>
            <div className="tutor-dir-body">
                <div className="tutor-dir-top">
                    <div>
                        <h3 className="tutor-dir-name">{tutor.title}</h3>
                        <span className="tutor-dir-subject">{tutor.subject}</span>
                    </div>
                    <span className="tutor-dir-grade">Year {tutor.year}</span>
                </div>

                <p className="tutor-dir-bio">{tutor.description}</p>

                <div className="tutor-dir-rating">
                    <Stars rating={rating.avg} />
                    <span className="rating-num">{rating.avg.toFixed(1)}</span>
                    <span className="rating-count">({rating.count} reviews)</span>
                </div>

                <div className="tutor-dir-avail">
                    <span className="avail-label">📅</span>
                    <span>{tutor.availableDays} · {tutor.availableTimes}</span>
                </div>

                <Link to="/schedule" className="tutor-dir-btn">Request Session →</Link>
            </div>
        </div>
    );
}

function Tutors() {
    const [search, setSearch] = useState('');
    const [subject, setSubject] = useState('All');
    const [grade, setGrade] = useState('All');
    const [day, setDay] = useState('All');
    const [sortBy, setSortBy] = useState('rating');

    // Merge real ratings from localStorage over base ratings
    const storedRatings = JSON.parse(localStorage.getItem('tutorRatings') || '{}');
    function getRating(tutorId) {
        const real = storedRatings[tutorId];
        if (real && real.length > 0) {
            const avg = real.reduce((s, r) => s + r.rating, 0) / real.length;
            return { avg: Math.round(avg * 10) / 10, count: real.length };
        }
        return baseRatings[tutorId] || { avg: 4.5, count: 5 };
    }

    const filtered = tutorsData
        .filter(t => {
            if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
                !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
            if (subject !== 'All' && !t.topic.toLowerCase().includes(subject.toLowerCase())) return false;
            if (grade !== 'All' && t.year !== grade) return false;
            if (day !== 'All' && !t.availableDays.includes(day)) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return getRating(b.id).avg - getRating(a.id).avg;
            if (sortBy === 'reviews') return getRating(b.id).count - getRating(a.id).count;
            return a.title.localeCompare(b.title);
        });

    const uniqueSubjects = new Set(tutorsData.map(t => t.topic.split(' ')[0]));

    return (
        <div className="tutors-dir-page">
            <div className="tutors-dir-header">
                <div className="tutors-dir-badge">Peer Tutors</div>
                <h1>Find Your Tutor</h1>
                <p>All tutors are quiz-certified, faculty-vetted students who volunteer their time to help peers succeed.</p>
            </div>

            <div className="tutors-dir-stats">
                <div className="dir-stat">
                    <span className="dir-stat-num">{tutorsData.length}</span>
                    <span className="dir-stat-label">Certified tutors</span>
                </div>
                <div className="dir-stat">
                    <span className="dir-stat-num">{uniqueSubjects.size}</span>
                    <span className="dir-stat-label">Subjects covered</span>
                </div>
                <div className="dir-stat">
                    <span className="dir-stat-num">4.8★</span>
                    <span className="dir-stat-label">Average rating</span>
                </div>
                <div className="dir-stat">
                    <span className="dir-stat-num">247</span>
                    <span className="dir-stat-label">Sessions completed</span>
                </div>
            </div>

            <div className="tutors-dir-controls">
                <input
                    className="tutors-dir-search"
                    type="text"
                    placeholder="Search by name or subject…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="tutors-dir-filters">
                    <select value={subject} onChange={e => setSubject(e.target.value)}>
                        {SUBJECTS.map(s => <option key={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
                    </select>
                    <select value={grade} onChange={e => setGrade(e.target.value)}>
                        {GRADES.map(g => <option key={g}>{g === 'All' ? 'All Grades' : `Year ${g}`}</option>)}
                    </select>
                    <select value={day} onChange={e => setDay(e.target.value)}>
                        {DAYS.map(d => <option key={d}>{d === 'All' ? 'Any Day' : d + 's'}</option>)}
                    </select>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="rating">Highest Rated</option>
                        <option value="reviews">Most Reviewed</option>
                        <option value="name">Name A–Z</option>
                    </select>
                </div>
            </div>

            <div className="tutors-dir-results-bar">
                <span>Showing <strong>{filtered.length}</strong> of {tutorsData.length} tutors</span>
                {(search || subject !== 'All' || grade !== 'All' || day !== 'All') && (
                    <button className="clear-filters-btn" onClick={() => {
                        setSearch(''); setSubject('All'); setGrade('All'); setDay('All');
                    }}>
                        Clear filters
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="tutors-dir-empty">
                    <p>No tutors match your filters.</p>
                    <button onClick={() => { setSearch(''); setSubject('All'); setGrade('All'); setDay('All'); }}>
                        Reset all filters
                    </button>
                </div>
            ) : (
                <div className="tutors-dir-grid">
                    {filtered.map(t => <TutorCard key={t.id} tutor={t} rating={getRating(t.id)} />)}
                </div>
            )}

            <div className="tutors-dir-cta">
                <h3>Know your subject well?</h3>
                <p>Join the tutor team — earn service hours and help your peers succeed.</p>
                <Link to="/apply" className="tutors-dir-apply-btn">Apply to Be a Tutor</Link>
            </div>
        </div>
    );
}

export default Tutors;
