import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push({ ...form, date: new Date().toISOString() });
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        setSubmitted(true);
    }

    if (submitted) return (
        <div className="contact-page">
            <div className="contact-success">
                <div className="contact-success-icon">✓</div>
                <h2>Message Sent!</h2>
                <p>Thanks for reaching out, <strong>{form.name}</strong>. We'll get back to you at <strong>{form.email}</strong> within 24 hours on school days.</p>
                <button onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSubmitted(false); }}>
                    Send another message
                </button>
            </div>
        </div>
    );

    return (
        <div className="contact-page">
            <div className="contact-header">
                <div className="contact-badge">Support</div>
                <h1>Get in Touch</h1>
                <p>Have a question, issue, or feedback? We're here to help.</p>
            </div>

            <div className="contact-layout">
                <div className="contact-form-card">
                    <h2 className="contact-form-title">Send us a message</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="contact-row">
                            <div className="contact-field">
                                <label htmlFor="c-name">Name</label>
                                <input id="c-name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                            </div>
                            <div className="contact-field">
                                <label htmlFor="c-email">Email</label>
                                <input id="c-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@school.edu" required />
                            </div>
                        </div>
                        <div className="contact-field">
                            <label htmlFor="c-subject">Subject</label>
                            <select id="c-subject" name="subject" value={form.subject} onChange={handleChange} required>
                                <option value="">Select a topic…</option>
                                <option>I can't log in</option>
                                <option>Tutor application question</option>
                                <option>Session booking issue</option>
                                <option>Report a tutor or student</option>
                                <option>Service hour verification</option>
                                <option>Feedback / suggestion</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="contact-field">
                            <label htmlFor="c-message">Message</label>
                            <textarea id="c-message" name="message" value={form.message} onChange={handleChange}
                                placeholder="Describe your issue or question in detail…" rows={5} required />
                        </div>
                        <button type="submit" className="contact-submit">Send Message</button>
                    </form>
                </div>

                <div className="contact-info">
                    <div className="contact-info-card">
                        <div className="contact-info-icon">@</div>
                        <h4>Email</h4>
                        <p>support@equalizer.edu</p>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">hrs</div>
                        <h4>School Hours</h4>
                        <p>Monday – Friday<br />7:30 AM – 4:00 PM</p>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">~24h</div>
                        <h4>Response Time</h4>
                        <p>We typically respond within 24 hours on school days.</p>
                    </div>
                    <div className="contact-info-card faq-cta">
                        <h4>Looking for quick answers?</h4>
                        <p>Our FAQ covers the most common questions about sessions, tutors, and service hours.</p>
                        <Link to="/faq">Browse the FAQ →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
