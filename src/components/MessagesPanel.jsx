import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './MessagesPanel.css';

function MessagesPanel({ userEmail, preCompose, onClearPreCompose, onUnreadChange }) {
    const [inbox, setInbox] = useState([]);
    const [sent, setSent] = useState([]);
    const [tab, setTab] = useState('inbox');
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [composing, setComposing] = useState(false);
    const [form, setForm] = useState({ to: '', subject: '', body: '' });
    const [replyBody, setReplyBody] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Pre-fill compose when triggered from a booking/request card
    useEffect(() => {
        if (preCompose) {
            setComposing(true);
            setSelectedThreadId(null);
            setForm({ to: preCompose.to || '', subject: preCompose.subject || '', body: '' });
            setError('');
            onClearPreCompose?.();
        }
    }, [preCompose]);

    // Subscribe to inbox
    useEffect(() => {
        if (!userEmail) return;
        const q = query(collection(db, 'messages'), where('toEmail', '==', userEmail), orderBy('timestamp', 'desc'));
        return onSnapshot(q, snap => setInbox(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => console.warn('Inbox error:', err));
    }, [userEmail]);

    // Subscribe to sent
    useEffect(() => {
        if (!userEmail) return;
        const q = query(collection(db, 'messages'), where('fromEmail', '==', userEmail), orderBy('timestamp', 'desc'));
        return onSnapshot(q, snap => setSent(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => console.warn('Sent error:', err));
    }, [userEmail]);

    // Build thread groups from all messages
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

    useEffect(() => { onUnreadChange?.(unreadCount); }, [unreadCount]);

    // Selected thread
    const selectedThread = selectedThreadId ? threads[selectedThreadId] : null;
    const selectedSorted = selectedThread ? [...selectedThread].sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)) : [];
    const selectedSubject = selectedSorted[0]?.subject || '';

    const markRead = async (threadId) => {
        const msgs = threads[threadId] || [];
        for (const m of msgs) {
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

    const handleSend = async () => {
        if (!form.to.trim() || !form.subject.trim() || !form.body.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        if (!form.to.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }
        setSending(true);
        setError('');
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
        } catch (e) {
            setError('Failed to send. Please try again.');
        } finally {
            setSending(false);
        }
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
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
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

    const startCompose = () => {
        setComposing(true);
        setSelectedThreadId(null);
        setForm({ to: '', subject: '', body: '' });
        setError('');
    };

    const goBack = () => {
        setSelectedThreadId(null);
        setComposing(false);
    };

    return (
        <div className="msg-panel">
            <div className="msg-header">
                <div className="msg-header-left">
                    <h3 className="msg-title">Messages</h3>
                    {unreadCount > 0 && <span className="msg-unread-badge">{unreadCount}</span>}
                </div>
                <button className="msg-compose-btn" onClick={startCompose}>+ Compose</button>
            </div>

            <div className="msg-tabs">
                <button className={`msg-tab ${tab === 'inbox' ? 'active' : ''}`} onClick={() => { setTab('inbox'); goBack(); }}>
                    Inbox {unreadCount > 0 && <span className="msg-tab-badge">{unreadCount}</span>}
                </button>
                <button className={`msg-tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => { setTab('sent'); goBack(); }}>
                    Sent
                </button>
            </div>

            <div className="msg-body">
                {/* Thread list */}
                {!composing && !selectedThreadId && (
                    <div className="msg-thread-list">
                        {displayThreads.length === 0 ? (
                            <div className="msg-empty">
                                {tab === 'inbox' ? 'Your inbox is empty.' : 'No sent messages yet.'}
                                {tab === 'inbox' && (
                                    <button className="msg-compose-link" onClick={startCompose}>Send your first message</button>
                                )}
                            </div>
                        ) : displayThreads.map(t => {
                            const other = tab === 'inbox' ? t.latest?.fromEmail : t.latest?.toEmail;
                            return (
                                <div key={t.threadId} className={`msg-thread-row ${t.hasUnread ? 'unread' : ''}`} onClick={() => openThread(t.threadId)}>
                                    <div className="msg-row-avatar">{(other || '?').charAt(0).toUpperCase()}</div>
                                    <div className="msg-row-info">
                                        <div className="msg-row-top">
                                            <span className="msg-row-from">{other}</span>
                                            <span className="msg-row-date">{fmt(t.latest?.timestamp)}</span>
                                        </div>
                                        <div className="msg-row-subject">{t.latest?.subject}</div>
                                        <div className="msg-row-preview">{(t.latest?.body || '').slice(0, 90)}{(t.latest?.body || '').length > 90 ? '…' : ''}</div>
                                    </div>
                                    {t.hasUnread && <div className="msg-dot" />}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Thread detail */}
                {!composing && selectedThreadId && (
                    <div className="msg-thread-view">
                        <button className="msg-back-btn" onClick={goBack}>← Back</button>
                        <h4 className="msg-thread-heading">{selectedSubject}</h4>
                        <div className="msg-message-list">
                            {selectedSorted.map(m => {
                                const isMine = m.fromEmail === userEmail;
                                return (
                                    <div key={m.id} className={`msg-message ${isMine ? 'msg-mine' : 'msg-theirs'}`}>
                                        <div className="msg-message-meta">
                                            <span className="msg-message-from">{isMine ? 'You' : m.fromEmail}</span>
                                            <span className="msg-message-date">{fmt(m.timestamp)}</span>
                                        </div>
                                        <div className="msg-message-body">{m.body}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="msg-reply-area">
                            <textarea
                                className="msg-reply-input"
                                placeholder="Write a reply..."
                                value={replyBody}
                                onChange={e => setReplyBody(e.target.value)}
                                rows={3}
                            />
                            <button className="msg-send-btn" onClick={handleReply} disabled={!replyBody.trim() || sending}>
                                {sending ? 'Sending…' : 'Send Reply'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Compose */}
                {composing && (
                    <div className="msg-compose-view">
                        <button className="msg-back-btn" onClick={goBack}>← Cancel</button>
                        <h4 className="msg-compose-heading">New Message</h4>
                        {error && <div className="msg-error">{error}</div>}
                        <div className="msg-field">
                            <label>To</label>
                            <input type="email" placeholder="recipient@school.edu" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
                        </div>
                        <div className="msg-field">
                            <label>Subject</label>
                            <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                        </div>
                        <div className="msg-field">
                            <label>Message</label>
                            <textarea rows={6} placeholder="Write your message..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
                        </div>
                        <button className="msg-send-btn msg-send-full" onClick={handleSend} disabled={sending}>
                            {sending ? 'Sending…' : 'Send Message'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPanel;
