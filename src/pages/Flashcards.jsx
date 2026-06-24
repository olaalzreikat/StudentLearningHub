import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subjects } from '../utils/subjectColors';
import './Flashcards.css';

const SUBJECT_LIST = ['All', ...subjects.map(s => s.name)];

const subjectColors = {
    Algebra: '#3b82f6',
    Geometry: '#8b5cf6',
    Calculus: '#ef4444',
    Trigonometry: '#f59e0b',
    Statistics: '#10b981',
};

function Flashcards() {
    const { user } = useAuth();
    const getKey = () => `flashcards-${user?.uid}`;

    const [cards, setCards] = useState([]);
    const [filter, setFilter] = useState('All');
    const [flipped, setFlipped] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ front: '', back: '', subject: 'Algebra' });
    const [studyMode, setStudyMode] = useState(false);
    const [studyIndex, setStudyIndex] = useState(0);
    const [studyFlipped, setStudyFlipped] = useState(false);
    const [editCard, setEditCard] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(getKey());
        if (saved) setCards(JSON.parse(saved));
    }, [user]);

    const save = (updated) => {
        setCards(updated);
        localStorage.setItem(getKey(), JSON.stringify(updated));
    };

    const handleAdd = () => {
        if (!form.front.trim() || !form.back.trim()) return;
        const card = { id: Date.now().toString(), front: form.front.trim(), back: form.back.trim(), subject: form.subject, createdAt: new Date().toISOString() };
        save([...cards, card]);
        setForm({ front: '', back: '', subject: form.subject });
        setShowAdd(false);
    };

    const handleDelete = (id) => {
        save(cards.filter(c => c.id !== id));
        setFlipped(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    const handleSaveEdit = () => {
        if (!editCard || !editCard.front.trim() || !editCard.back.trim()) return;
        save(cards.map(c => c.id === editCard.id ? { ...c, front: editCard.front, back: editCard.back, subject: editCard.subject } : c));
        setEditCard(null);
    };

    const filtered = filter === 'All' ? cards : cards.filter(c => c.subject === filter);

    // Study mode
    const studyCards = filtered;
    const currentStudyCard = studyCards[studyIndex];

    const startStudy = () => {
        if (filtered.length === 0) return;
        setStudyIndex(0);
        setStudyFlipped(false);
        setStudyMode(true);
    };

    const studyNext = () => {
        setStudyFlipped(false);
        setTimeout(() => setStudyIndex(i => Math.min(i + 1, studyCards.length - 1)), 150);
    };

    const studyPrev = () => {
        setStudyFlipped(false);
        setTimeout(() => setStudyIndex(i => Math.max(i - 1, 0)), 150);
    };

    if (studyMode && currentStudyCard) {
        const color = subjectColors[currentStudyCard.subject] || '#1e40af';
        return (
            <div className="fc-study-page">
                <div className="fc-study-top">
                    <button className="fc-study-exit" onClick={() => setStudyMode(false)}>Exit Study</button>
                    <span className="fc-study-progress">{studyIndex + 1} / {studyCards.length}</span>
                </div>
                <div className="fc-study-bar-wrap">
                    <div className="fc-study-bar" style={{ width: `${((studyIndex + 1) / studyCards.length) * 100}%`, background: color }} />
                </div>

                <div className={`fc-study-card ${studyFlipped ? 'flipped' : ''}`} onClick={() => setStudyFlipped(f => !f)}>
                    <div className="fc-study-inner">
                        <div className="fc-study-face fc-study-front" style={{ borderTop: `4px solid ${color}` }}>
                            <span className="fc-face-label">Question</span>
                            <p className="fc-study-text">{currentStudyCard.front}</p>
                            <span className="fc-tap-hint">Tap to flip</span>
                        </div>
                        <div className="fc-study-face fc-study-back" style={{ borderTop: `4px solid ${color}`, background: color }}>
                            <span className="fc-face-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Answer</span>
                            <p className="fc-study-text" style={{ color: '#fff' }}>{currentStudyCard.back}</p>
                        </div>
                    </div>
                </div>

                <div className="fc-study-nav">
                    <button className="fc-nav-btn" onClick={studyPrev} disabled={studyIndex === 0}>Prev</button>
                    <button className="fc-flip-btn" onClick={() => setStudyFlipped(f => !f)}>
                        {studyFlipped ? 'Show Question' : 'Reveal Answer'}
                    </button>
                    <button className="fc-nav-btn" onClick={studyNext} disabled={studyIndex === studyCards.length - 1}>Next</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fc-page">
            <div className="fc-container">
                <div className="fc-header">
                    <div>
                        <h1 className="fc-title">My Flashcards</h1>
                        <p className="fc-subtitle">{cards.length} card{cards.length !== 1 ? 's' : ''} total</p>
                    </div>
                    <div className="fc-header-actions">
                        {filtered.length > 0 && (
                            <button className="fc-study-btn" onClick={startStudy}>Study Mode</button>
                        )}
                        <button className="fc-add-btn" onClick={() => setShowAdd(true)}>+ New Card</button>
                    </div>
                </div>

                {/* Subject filter */}
                <div className="fc-filter-row">
                    {SUBJECT_LIST.map(s => (
                        <button
                            key={s}
                            className={`fc-filter-pill ${filter === s ? 'active' : ''}`}
                            style={filter === s && s !== 'All' ? { background: subjectColors[s], borderColor: subjectColors[s], color: '#fff' } : {}}
                            onClick={() => setFilter(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Cards grid */}
                {filtered.length === 0 ? (
                    <div className="fc-empty">
                        <div className="fc-empty-icon">+</div>
                        <h3>{cards.length === 0 ? 'No flashcards yet' : `No ${filter} cards`}</h3>
                        <p>{cards.length === 0 ? 'Create your first card to start studying.' : 'Switch filters or create a new card for this subject.'}</p>
                        <button className="fc-add-btn" onClick={() => setShowAdd(true)}>Create a card</button>
                    </div>
                ) : (
                    <div className="fc-grid">
                        {filtered.map(card => {
                            const color = subjectColors[card.subject] || '#1e40af';
                            const isFlipped = !!flipped[card.id];
                            return (
                                <div
                                    key={card.id}
                                    className={`fc-card ${isFlipped ? 'flipped' : ''}`}
                                    onClick={() => setFlipped(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                                >
                                    <div className="fc-card-inner">
                                        <div className="fc-card-face fc-card-front" style={{ borderTop: `3px solid ${color}` }}>
                                            <span className="fc-card-subject" style={{ color }}>{card.subject}</span>
                                            <p className="fc-card-text">{card.front}</p>
                                            <span className="fc-card-hint">Click to flip</span>
                                        </div>
                                        <div className="fc-card-face fc-card-back" style={{ background: color }}>
                                            <span className="fc-card-subject" style={{ color: 'rgba(255,255,255,0.75)' }}>Answer</span>
                                            <p className="fc-card-text" style={{ color: '#fff' }}>{card.back}</p>
                                        </div>
                                    </div>
                                    <div className="fc-card-controls" onClick={e => e.stopPropagation()}>
                                        <button className="fc-edit-btn" onClick={() => setEditCard({ ...card })}>Edit</button>
                                        <button className="fc-delete-btn" onClick={() => handleDelete(card.id)}>Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div className="fc-modal-overlay" onClick={() => setShowAdd(false)} role="presentation">
                    <div className="fc-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="fc-modal-header">
                            <h2>New Flashcard</h2>
                            <button className="fc-modal-close" onClick={() => setShowAdd(false)}>×</button>
                        </div>
                        <div className="fc-modal-body">
                            <div className="fc-form-group">
                                <label>Subject</label>
                                <div className="fc-subject-row">
                                    {subjects.map(s => (
                                        <button
                                            key={s.name}
                                            type="button"
                                            className={`fc-subj-btn ${form.subject === s.name ? 'selected' : ''}`}
                                            style={form.subject === s.name ? { background: subjectColors[s.name], borderColor: subjectColors[s.name], color: '#fff' } : {}}
                                            onClick={() => setForm(f => ({ ...f, subject: s.name }))}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="fc-form-group">
                                <label>Front <span className="fc-req">(question / term)</span></label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g., What is the quadratic formula?"
                                    value={form.front}
                                    onChange={e => setForm(f => ({ ...f, front: e.target.value }))}
                                />
                            </div>
                            <div className="fc-form-group">
                                <label>Back <span className="fc-req">(answer / definition)</span></label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g., x = (-b ± sqrt(b²-4ac)) / 2a"
                                    value={form.back}
                                    onChange={e => setForm(f => ({ ...f, back: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="fc-modal-footer">
                            <button className="fc-cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                            <button
                                className="fc-save-btn"
                                onClick={handleAdd}
                                disabled={!form.front.trim() || !form.back.trim()}
                            >
                                Add Card
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editCard && (
                <div className="fc-modal-overlay" onClick={() => setEditCard(null)} role="presentation">
                    <div className="fc-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="fc-modal-header">
                            <h2>Edit Flashcard</h2>
                            <button className="fc-modal-close" onClick={() => setEditCard(null)}>×</button>
                        </div>
                        <div className="fc-modal-body">
                            <div className="fc-form-group">
                                <label>Subject</label>
                                <div className="fc-subject-row">
                                    {subjects.map(s => (
                                        <button
                                            key={s.name}
                                            type="button"
                                            className={`fc-subj-btn ${editCard.subject === s.name ? 'selected' : ''}`}
                                            style={editCard.subject === s.name ? { background: subjectColors[s.name], borderColor: subjectColors[s.name], color: '#fff' } : {}}
                                            onClick={() => setEditCard(c => ({ ...c, subject: s.name }))}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="fc-form-group">
                                <label>Front</label>
                                <textarea
                                    rows={3}
                                    value={editCard.front}
                                    onChange={e => setEditCard(c => ({ ...c, front: e.target.value }))}
                                />
                            </div>
                            <div className="fc-form-group">
                                <label>Back</label>
                                <textarea
                                    rows={3}
                                    value={editCard.back}
                                    onChange={e => setEditCard(c => ({ ...c, back: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="fc-modal-footer">
                            <button className="fc-cancel-btn" onClick={() => setEditCard(null)}>Cancel</button>
                            <button
                                className="fc-save-btn"
                                onClick={handleSaveEdit}
                                disabled={!editCard.front.trim() || !editCard.back.trim()}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Flashcards;
