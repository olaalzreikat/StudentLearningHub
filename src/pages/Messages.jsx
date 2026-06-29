import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './Messages.css';

function Messages() {
    const { user } = useAuth();
    const userEmail = user?.email;
    const location = useLocation();

    const [inbox, setInbox]   = useState([]);
    const [sent, setSent]     = useState([]);
    const [tab, setTab]       = useState('inbox');
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [composing, setComposing] = useState(false);
    const [form, setForm]     = useState({ to: '', subject: '', body: '' });
    const [replyBody, setReplyBody] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError]   = useState('');
    const [search, setSearch] = useState('');
    const [expandedMsgId, setExpandedMsgId] = useState(null);

    const avatarColor = (email = '') => {
        const colors = ['#1a73e8','#34a853','#9c27b0','#00bcd4','#ff5722','#607d8b','#e91e63','#ff9800'];
        let h = 0;
        for (let i = 0; i < email.length; i++) h = email.charCodeAt(i) + ((h << 5) - h);
        return colors[Math.abs(h) % colors.length];
    };

    const displayName = (email = '') => {
        const local = email.split('@')[0];
        return local.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    useEffect(() => {
        if (location.state?.compose) {
            const { to, subject } = location.state.compose;
            setComposing(true);
            setSelectedThreadId(null);
            setForm({ to: to || '', subject: subject || '', body: '' });
            window.history.replaceState({}, '');
        }
    }, []);

    useEffect(() => {
        if (!userEmail) return;
        const q = query(collection(db, 'messages'), where('toEmail', '==', userEmail));
        return onSnapshot(q, snap => setInbox(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => console.warn(err));
    }, [userEmail]);

    useEffect(() => {
        if (!userEmail) return;
        const q = query(collection(db, 'messages'), where('fromEmail', '==', userEmail));
        return onSnapshot(q, snap => setSent(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => console.warn(err));
    }, [userEmail]);

    const all = Array.from(new Map([...inbox, ...sent].map(m => [m.id, m])).values());
    const threads = {};
    all.forEach(m => {
        const tid = m.threadId || m.id;
        if (!threads[tid]) threads[tid] = [];
        threads[tid].push(m);
    });

    const threadList = Object.entries(threads).map(([threadId, msgs]) => {
        const sorted = [...msgs].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        const hasUnread = msgs.some(m => m.toEmail === userEmail && !m.read);
        return {
            threadId,
            latest: sorted[0],
            msgs: [...msgs].sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)),
            hasUnread,
        };
    }).sort((a, b) => (b.latest?.timestamp?.seconds || 0) - (a.latest?.timestamp?.seconds || 0));

    const inboxThreads = threadList.filter(t => t.msgs.some(m => m.toEmail === userEmail));
    const sentThreads  = threadList.filter(t => t.msgs.some(m => m.fromEmail === userEmail));
    const unreadCount  = inboxThreads.filter(t => t.hasUnread).length;

    useEffect(() => {
        localStorage.setItem('msg-unread-count', String(unreadCount));
        window.dispatchEvent(new Event('msg-unread-update'));
    }, [unreadCount]);

    const displayThreads = (tab === 'inbox' ? inboxThreads : sentThreads).filter(t => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (t.latest?.subject || '').toLowerCase().includes(s)
            || (t.latest?.fromEmail || '').toLowerCase().includes(s)
            || (t.latest?.toEmail || '').toLowerCase().includes(s)
            || (t.latest?.body || '').toLowerCase().includes(s);
    });

    const selectedThread = selectedThreadId ? threads[selectedThreadId] : null;
    const selectedSorted = selectedThread
        ? [...selectedThread].sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0))
        : [];
    const selectedSubject = selectedSorted[0]?.subject || '';

    const markRead = async (threadId) => {
        for (const m of (threads[threadId] || [])) {
            if (m.toEmail === userEmail && !m.read) {
                try { await updateDoc(doc(db, 'messages', m.id), { read: true }); } catch {}
            }
        }
    };

    const openThread = (threadId) => {
        setSelectedThreadId(threadId);
        setComposing(false);
        setReplyBody('');
        markRead(threadId);
    };

    const startCompose = () => {
        setComposing(true);
        setSelectedThreadId(null);
        setForm({ to: '', subject: '', body: '' });
        setError('');
    };

    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

    const handleSend = async () => {
        if (!form.to.trim() || !form.subject.trim() || !form.body.trim()) { setError('Please fill in all fields.'); return; }
        if (!form.to.includes('@')) { setError('Please enter a valid email address.'); return; }
        setSending(true); setError('');
        try {
            const ref = doc(collection(db, 'messages'));
            await Promise.race([
                setDoc(ref, {
                    fromEmail: userEmail,
                    toEmail: form.to.trim().toLowerCase(),
                    subject: form.subject.trim(),
                    body: form.body.trim(),
                    threadId: ref.id,
                    parentId: null,
                    timestamp: serverTimestamp(),
                    read: false,
                }),
                timeout(8000),
            ]);
            setComposing(false);
            setForm({ to: '', subject: '', body: '' });
            setTab('sent');
            setSelectedThreadId(ref.id);
        } catch (e) {
            setError(e?.message === 'timeout'
                ? 'Connection timed out. Check your internet and try again.'
                : 'Failed to send. Please try again.');
        } finally { setSending(false); }
    };

    const handleReply = async () => {
        if (!replyBody.trim() || !selectedThreadId || sending) return;
        setSending(true);
        const first = selectedSorted[0];
        const replyTo = first?.fromEmail === userEmail ? first?.toEmail : first?.fromEmail;
        try {
            const ref = doc(collection(db, 'messages'));
            await Promise.race([
                setDoc(ref, {
                    fromEmail: userEmail,
                    toEmail: replyTo,
                    subject: `Re: ${selectedSubject.replace(/^Re:\s*/i, '')}`,
                    body: replyBody.trim(),
                    threadId: selectedThreadId,
                    parentId: selectedSorted[selectedSorted.length - 1]?.id || null,
                    timestamp: serverTimestamp(),
                    read: false,
                }),
                timeout(8000),
            ]);
            setReplyBody('');
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const fmt = (ts) => {
        if (!ts) return '';
        try {
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            const now = new Date();
            if (d.toDateString() === now.toDateString())
                return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return ''; }
    };

    return (
        <div className="messages-page">

            {/* ── Column 1: Sidebar nav ── */}
            <div className="messages-sidebar">
                <button className="messages-compose-btn" onClick={startCompose}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                    <span>Compose</span>
                </button>

                <button
                    className={`messages-nav-item ${tab === 'inbox' ? 'active' : ''}`}
                    onClick={() => { setTab('inbox'); setComposing(false); }}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5v-3h3.55c.64 1.19 1.89 2 3.34 2h.22c1.45 0 2.7-.81 3.34-2H19v3zm0-5h-4a2 2 0 01-2 2h-.22a2 2 0 01-2-2H5V5h14v9z"/>
                    </svg>
                    <span className="messages-nav-label">Inbox</span>
                    {unreadCount > 0 && <span className="messages-nav-badge">{unreadCount}</span>}
                </button>

                <button
                    className={`messages-nav-item ${tab === 'sent' ? 'active' : ''}`}
                    onClick={() => { setTab('sent'); setComposing(false); }}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    <span className="messages-nav-label">Sent</span>
                </button>
            </div>

            {/* ── Column 2: Thread list (always visible) ── */}
            <div className="messages-thread-pane">
                <div className="messages-search">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        placeholder={`Search ${tab}`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="messages-thread-list">
                    {displayThreads.length === 0 ? (
                        <div className="messages-empty-list">
                            {search ? 'No results found.' : tab === 'inbox' ? 'Your inbox is empty.' : 'No sent messages yet.'}
                        </div>
                    ) : displayThreads.map(t => {
                        const other = tab === 'inbox' ? (t.latest?.fromEmail || '') : (t.latest?.toEmail || '');
                        return (
                            <div
                                key={t.threadId}
                                className={`messages-thread-row ${t.hasUnread ? 'unread' : ''} ${selectedThreadId === t.threadId ? 'selected' : ''}`}
                                onClick={() => openThread(t.threadId)}
                            >
                                {t.hasUnread && <div className="messages-unread-dot" />}
                                <div className="messages-row-body">
                                    <div className="messages-row-top">
                                        <span className="messages-row-sender">{other || '(no sender)'}</span>
                                        <span className="messages-row-date">{fmt(t.latest?.timestamp)}</span>
                                    </div>
                                    <div className="messages-row-bottom">
                                        <span className="messages-row-subject">{t.latest?.subject}</span>
                                        <span className="messages-row-divider">—</span>
                                        <span className="messages-row-preview">{t.latest?.body}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Column 3: Conversation / compose / empty ── */}
            <div className="messages-main">

                {/* Empty state */}
                {!composing && !selectedThreadId && (
                    <div className="messages-empty-state">
                        <div className="messages-empty-icon">
                            <svg viewBox="0 0 48 48" fill="none">
                                <rect x="4" y="10" width="40" height="30" rx="4" stroke="#9aa0a6" strokeWidth="2.5"/>
                                <path d="M4 16l20 13 20-13" stroke="#9aa0a6" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <p className="messages-empty-title">Select a conversation</p>
                        <p className="messages-empty-sub">Choose a thread from the list, or compose a new message.</p>
                    </div>
                )}

                {/* Thread view */}
                {!composing && selectedThreadId && (
                    <div className="messages-conversation">
                        <div className="messages-conversation-header">
                            <h2 className="messages-conversation-subject">{selectedSubject}</h2>
                            <span className="messages-conversation-count">{selectedSorted.length} message{selectedSorted.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="messages-message-list">
                            {selectedSorted.map(m => {
                                const isMine = m.fromEmail === userEmail;
                                const senderEmail = isMine ? userEmail : (m.fromEmail || '?');
                                return (
                                    <div key={m.id} className={`messages-message ${isMine ? 'mine' : 'theirs'}`}>
                                        {!isMine && (
                                            <div className="messages-bubble-avatar" style={{ background: avatarColor(senderEmail) }}>
                                                {senderEmail.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="messages-bubble-wrap">
                                            {!isMine && <span className="messages-bubble-name">{displayName(m.fromEmail)}</span>}
                                            <div className="messages-bubble">{m.body}</div>
                                            <span className="messages-bubble-time">{fmt(m.timestamp)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="messages-reply-box">
                            <div className="messages-reply-inner">
                                <textarea
                                    className="messages-reply-input"
                                    placeholder="Reply..."
                                    value={replyBody}
                                    onChange={e => setReplyBody(e.target.value)}
                                    rows={3}
                                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(); }}
                                />
                                <div className="messages-reply-footer">
                                    <span className="messages-reply-hint">Ctrl+Enter to send</span>
                                    <button className="messages-send-btn" onClick={handleReply} disabled={!replyBody.trim() || sending}>
                                        {sending ? 'Sending…' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compose */}
                {composing && (
                    <div className="messages-compose-panel">
                        <div className="messages-compose-header">
                            <h2 className="messages-compose-title">New Message</h2>
                            <button className="messages-cancel-btn" onClick={() => setComposing(false)} title="Cancel">✕</button>
                        </div>
                        {error && <div className="messages-error">{error}</div>}
                        <div className="messages-compose-form">
                            <div className="messages-field">
                                <label>To</label>
                                <input type="email" placeholder="recipient@example.com" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
                            </div>
                            <div className="messages-field">
                                <label>Subject</label>
                                <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div className="messages-field-body">
                                <textarea placeholder="Write your message here..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
                            </div>
                        </div>
                        <div className="messages-compose-footer">
                            <button className="messages-send-btn" onClick={handleSend} disabled={sending}>
                                {sending ? 'Sending…' : 'Send'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
