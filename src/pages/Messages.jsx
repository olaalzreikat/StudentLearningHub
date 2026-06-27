import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    // Pre-fill compose when navigated here from a booking "Message" button
    useEffect(() => {
        if (location.state?.compose) {
            const { to, subject } = location.state.compose;
            setComposing(true);
            setForm({ to: to || '', subject: subject || '', body: '' });
            window.history.replaceState({}, '');
        }
    }, []);
    const [replyBody, setReplyBody] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError]   = useState('');

    useEffect(() => {
        if (!userEmail) return;
        const q = query(collection(db, 'messages'), where('toEmail', '==', userEmail), orderBy('timestamp', 'desc'));
        return onSnapshot(q, snap => setInbox(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => console.warn(err));
    }, [userEmail]);

    useEffect(() => {
        if (!userEmail) return;
        const q = query(collection(db, 'messages'), where('fromEmail', '==', userEmail), orderBy('timestamp', 'desc'));
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
    const displayThreads = tab === 'inbox' ? inboxThreads : sentThreads;
    const unreadCount = inboxThreads.filter(t => t.hasUnread).length;

    // Persist unread count for navbar badge
    useEffect(() => {
        localStorage.setItem('msg-unread-count', String(unreadCount));
        window.dispatchEvent(new Event('msg-unread-update'));
    }, [unreadCount]);

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

    const handleSend = async () => {
        if (!form.to.trim() || !form.subject.trim() || !form.body.trim()) { setError('Please fill in all fields.'); return; }
        if (!form.to.includes('@')) { setError('Please enter a valid email address.'); return; }
        setSending(true); setError('');
        try {
            const ref = doc(collection(db, 'messages'));
            await setDoc(ref, {
                fromEmail: userEmail,
                toEmail: form.to.trim().toLowerCase(),
                subject: form.subject.trim(),
                body: form.body.trim(),
                threadId: ref.id,
                parentId: null,
                timestamp: serverTimestamp(),
                read: false,
            });
            setComposing(false);
            setForm({ to: '', subject: '', body: '' });
            setTab('sent');
            setSelectedThreadId(ref.id);
        } catch { setError('Failed to send. Please try again.'); }
        finally { setSending(false); }
    };

    const handleReply = async () => {
        if (!replyBody.trim() || !selectedThreadId || sending) return;
        setSending(true);
        const first = selectedSorted[0];
        const replyTo = first?.fromEmail === userEmail ? first?.toEmail : first?.fromEmail;
        try {
            const ref = doc(collection(db, 'messages'));
            await setDoc(ref, {
                fromEmail: userEmail,
                toEmail: replyTo,
                subject: `Re: ${selectedSubject.replace(/^Re:\s*/i, '')}`,
                body: replyBody.trim(),
                threadId: selectedThreadId,
                parentId: selectedSorted[selectedSorted.length - 1]?.id || null,
                timestamp: serverTimestamp(),
                read: false,
            });
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
            {/* Header */}
            <div className="messages-header">
                <div className="messages-header-content">
                    <div>
                        <h1 className="messages-title">Messages</h1>
                        <p className="messages-subtitle">Communicate with tutors and students</p>
                    </div>
                    <button className="messages-compose-btn" onClick={startCompose}>
                        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 4H4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                            <path d="M16.5 2.5a1.5 1.5 0 012.121 2.121l-7.829 7.829-3 .879.879-3 7.829-7.829z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                        </svg>
                        Compose
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="messages-body">
                {/* Left sidebar — thread list */}
                <div className="messages-sidebar">
                    <div className="messages-tabs">
                        <button
                            className={`messages-tab ${tab === 'inbox' ? 'active' : ''}`}
                            onClick={() => { setTab('inbox'); setSelectedThreadId(null); setComposing(false); }}
                        >
                            Inbox
                            {unreadCount > 0 && <span className="messages-tab-badge">{unreadCount}</span>}
                        </button>
                        <button
                            className={`messages-tab ${tab === 'sent' ? 'active' : ''}`}
                            onClick={() => { setTab('sent'); setSelectedThreadId(null); setComposing(false); }}
                        >
                            Sent
                        </button>
                    </div>

                    <div className="messages-thread-list">
                        {displayThreads.length === 0 ? (
                            <div className="messages-empty-list">
                                {tab === 'inbox' ? 'Your inbox is empty.' : 'No sent messages yet.'}
                            </div>
                        ) : displayThreads.map(t => {
                            const other = tab === 'inbox' ? t.latest?.fromEmail : t.latest?.toEmail;
                            const isActive = selectedThreadId === t.threadId;
                            return (
                                <div
                                    key={t.threadId}
                                    className={`messages-thread-row ${t.hasUnread ? 'unread' : ''} ${isActive ? 'selected' : ''}`}
                                    onClick={() => openThread(t.threadId)}
                                >
                                    <div className="messages-row-avatar">{(other || '?').charAt(0).toUpperCase()}</div>
                                    <div className="messages-row-info">
                                        <div className="messages-row-top">
                                            <span className="messages-row-from">{other}</span>
                                            <span className="messages-row-date">{fmt(t.latest?.timestamp)}</span>
                                        </div>
                                        <div className="messages-row-subject">{t.latest?.subject}</div>
                                        <div className="messages-row-preview">
                                            {(t.latest?.body || '').slice(0, 72)}{(t.latest?.body || '').length > 72 ? '…' : ''}
                                        </div>
                                    </div>
                                    {t.hasUnread && <div className="messages-dot" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right panel — conversation / compose / empty state */}
                <div className="messages-main">
                    {/* Empty state */}
                    {!composing && !selectedThreadId && (
                        <div className="messages-empty-state">
                            <div className="messages-empty-icon">
                                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="4" y="10" width="40" height="30" rx="4" stroke="#cbd5e1" strokeWidth="2.5"/>
                                    <path d="M4 16l20 13 20-13" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <p className="messages-empty-title">Select a conversation</p>
                            <p className="messages-empty-sub">Choose a thread from the left, or compose a new message.</p>
                            <button className="messages-compose-btn-alt" onClick={startCompose}>Compose new message</button>
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
                                    return (
                                        <div key={m.id} className={`messages-message ${isMine ? 'mine' : 'theirs'}`}>
                                            <div className="messages-message-avatar">
                                                {(isMine ? userEmail : m.fromEmail).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="messages-message-bubble">
                                                <div className="messages-message-meta">
                                                    <span className="messages-message-from">{isMine ? 'You' : m.fromEmail}</span>
                                                    <span className="messages-message-date">{fmt(m.timestamp)}</span>
                                                </div>
                                                <div className="messages-message-body">{m.body}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="messages-reply-box">
                                <textarea
                                    className="messages-reply-input"
                                    placeholder="Write a reply..."
                                    value={replyBody}
                                    onChange={e => setReplyBody(e.target.value)}
                                    rows={4}
                                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(); }}
                                />
                                <div className="messages-reply-footer">
                                    <span className="messages-reply-hint">Ctrl+Enter to send</span>
                                    <button className="messages-send-btn" onClick={handleReply} disabled={!replyBody.trim() || sending}>
                                        {sending ? 'Sending…' : 'Send Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compose */}
                    {composing && (
                        <div className="messages-compose">
                            <div className="messages-compose-header">
                                <h2 className="messages-compose-title">New Message</h2>
                                <button className="messages-cancel-btn" onClick={() => setComposing(false)}>Cancel</button>
                            </div>
                            {error && <div className="messages-error">{error}</div>}
                            <div className="messages-field">
                                <label>To</label>
                                <input type="email" placeholder="recipient@example.com" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
                            </div>
                            <div className="messages-field">
                                <label>Subject</label>
                                <input type="text" placeholder="What's this about?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div className="messages-field messages-field-grow">
                                <label>Message</label>
                                <textarea placeholder="Write your message..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
                            </div>
                            <div className="messages-compose-footer">
                                <button className="messages-send-btn messages-send-full" onClick={handleSend} disabled={sending}>
                                    {sending ? 'Sending…' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messages;
