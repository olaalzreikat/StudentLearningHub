import { useState, useEffect, useRef } from 'react';
import {
    collection, addDoc, onSnapshot, query, orderBy,
    doc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './ChatModal.css';

const getReadKey = (uid, reqId) => `chatRead-${uid}-${reqId}`;

function ChatModal({ requestId, otherName, onClose }) {
    const { user, role } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);

    const messagesContainerRef = useRef(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const isAtBottomRef = useRef(true);
    const isFirstLoadRef = useRef(true);
    const typingTimeoutRef = useRef(null);

    const markRead = () => {
        localStorage.setItem(getReadKey(user.uid, requestId), new Date().toISOString());
    };

    // Subscribe to messages
    useEffect(() => {
        if (!requestId) return;
        markRead();
        inputRef.current?.focus();

        const q = query(
            collection(db, 'conversations', requestId, 'messages'),
            orderBy('timestamp', 'asc')
        );
        const unsub = onSnapshot(q,
            snap => {
                setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                markRead();
            },
            err => console.error('Chat listen error (check Firestore rules):', err)
        );
        return () => unsub();
    }, [requestId]);

    // Subscribe to typing indicator on the conversation doc
    useEffect(() => {
        if (!requestId) return;
        const unsub = onSnapshot(doc(db, 'conversations', requestId), snap => {
            const data = snap.data() || {};
            const typing = data.typing || {};
            setOtherTyping(
                Object.entries(typing).some(([uid, ts]) => uid !== user.uid && ts !== null)
            );
        });
        return () => unsub();
    }, [requestId, user.uid]);

    // Clear own typing indicator on unmount
    useEffect(() => {
        return () => {
            clearTimeout(typingTimeoutRef.current);
            setDoc(doc(db, 'conversations', requestId), {
                typing: { [user.uid]: null }
            }, { merge: true }).catch(() => {});
        };
    }, [requestId, user.uid]);

    // Smart auto-scroll: only scroll when already near the bottom
    useEffect(() => {
        if (isFirstLoadRef.current && messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'auto' });
            isFirstLoadRef.current = false;
        } else if (isAtBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, otherTyping]);

    const handleScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };

    // setTyping uses setDoc+merge so it works even if the conversation doc doesn't exist yet
    const setTypingState = async (isTyping) => {
        try {
            await setDoc(doc(db, 'conversations', requestId), {
                typing: { [user.uid]: isTyping ? serverTimestamp() : null }
            }, { merge: true });
        } catch {}
    };

    const handleTyping = (value) => {
        setText(value);
        if (!value.trim()) return;
        setTypingState(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingState(false), 2000);
    };

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        setText('');

        clearTimeout(typingTimeoutRef.current);
        setTypingState(false);

        try {
            await addDoc(collection(db, 'conversations', requestId, 'messages'), {
                text: trimmed,
                senderId: user.uid,
                senderEmail: user.email,
                senderRole: role,
                timestamp: serverTimestamp(),
            });
        } catch (e) {
            console.error('Send failed:', e);
        } finally {
            setSending(false);
        }
    };

    // Build grouped list: inject date dividers between day boundaries
    const grouped = (() => {
        const items = [];
        let lastDateStr = null;
        messages.forEach(msg => {
            const d = msg.timestamp?.toDate?.();
            const dateStr = d ? d.toDateString() : null;
            if (dateStr && dateStr !== lastDateStr) {
                lastDateStr = dateStr;
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                const label = dateStr === today ? 'Today'
                    : dateStr === yesterday ? 'Yesterday'
                    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                items.push({ kind: 'divider', label, id: `div-${dateStr}` });
            }
            items.push({ kind: 'msg', ...msg });
        });
        return items;
    })();

    const formatTime = ts => {
        if (!ts) return '';
        try { return ts.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
        catch { return ''; }
    };

    return (
        <div className="chat-overlay" onClick={onClose} role="presentation">
            <div className="chat-panel" role="dialog" aria-modal="true" aria-label="Session chat" onClick={e => e.stopPropagation()}>

                <div className="chat-header">
                    <div className="chat-header-info">
                        <div className="chat-avatar">{(otherName || '?').charAt(0).toUpperCase()}</div>
                        <div className="chat-header-text">
                            <span className="chat-name">{otherName}</span>
                            <span className="chat-sub">Session Chat</span>
                        </div>
                    </div>
                    <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">×</button>
                </div>

                <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
                    {messages.length === 0 && (
                        <div className="chat-empty">No messages yet. Say hi!</div>
                    )}

                    {grouped.map(item => {
                        if (item.kind === 'divider') {
                            return (
                                <div key={item.id} className="chat-date-divider">
                                    <span>{item.label}</span>
                                </div>
                            );
                        }
                        const isMine = item.senderId === user.uid;
                        return (
                            <div key={item.id} className={`chat-row ${isMine ? 'mine' : 'theirs'}`}>
                                {!isMine && (
                                    <div className="chat-row-avatar">
                                        {(otherName || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="chat-bubble-wrap">
                                    <div className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                                        {item.text}
                                    </div>
                                    <span className="chat-time">{formatTime(item.timestamp)}</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Typing indicator */}
                    {otherTyping && (
                        <div className="chat-row theirs">
                            <div className="chat-row-avatar">
                                {(otherName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="chat-bubble-wrap">
                                <div className="chat-bubble bubble-theirs typing-bubble">
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                <div className="chat-input-row">
                    <input
                        ref={inputRef}
                        className="chat-input"
                        placeholder="Type a message..."
                        value={text}
                        onChange={e => handleTyping(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={!text.trim() || sending}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export { getReadKey };
export default ChatModal;
