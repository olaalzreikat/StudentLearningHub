import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const faqs = [
    {
        category: 'General',
        q: 'Is this platform free to use?',
        a: 'Yes, completely free for every student and tutor. Equalizer is a student-run, school-sponsored platform. There are no fees, subscriptions, or hidden charges. Tutors earn verified service hours in exchange for their time, not payment.'
    },
    {
        category: 'Becoming a Tutor',
        q: 'How do I become a tutor?',
        a: 'From your student dashboard, click "Become a Tutor." You\'ll complete a 3-step process: (1) fill out a short application with your name, grade, subjects you want to teach, and a teacher reference; (2) pass a subject skills quiz to verify your knowledge (4/5 per subject at 80%); (3) your application goes to our leadership team for review. Once approved, you\'ll complete a short training checklist before your profile goes live. The whole process usually takes 2-3 school days.'
    },
    {
        category: 'Becoming a Tutor',
        q: 'What happens if I fail the tutor qualification quiz?',
        a: 'No penalty. You can retake it anytime. The quiz is designed to make sure tutors genuinely understand the material they\'re teaching, not to discourage anyone from applying. We recommend using the Resources section to review the subject before retaking. Your best score is what counts.'
    },
    {
        category: 'Becoming a Tutor',
        q: 'Who reviews tutor applications?',
        a: 'Applications are reviewed by the Equalizer student leadership team, with a faculty advisor providing final sign-off. This keeps the platform student-run while ensuring quality and safety. Since this involves students working together, a staff advisor helps with accountability.'
    },
    {
        category: 'Service Hours',
        q: 'How are tutor hours verified for service credit?',
        a: 'Every session booked through the platform is automatically logged under the tutor\'s account: date, subject, student, and duration are all recorded. After a session, both parties confirm it was completed. Tutors can download a certified Service Hour Report from their dashboard at any time. The report is formatted for submission to your school or NHS chapter and includes a platform verification signature.'
    },
    {
        category: 'Sessions',
        q: 'How do I book a tutoring session?',
        a: 'Go to the Schedule page and browse available tutors. You can filter by subject, grade level, and availability. Click "Request Session" on any tutor card, fill in the subject, date, time, and a short description of what you need help with, then submit. The tutor will accept or decline within 24 hours and send you a meeting link.'
    },
    {
        category: 'Sessions',
        q: 'How do I cancel or reschedule a session?',
        a: 'Go to your Dashboard and find the session under "Upcoming Sessions." Click the cancel or reschedule option. Please cancel at least 24 hours in advance so your tutor can open that slot to other students. Repeated last-minute cancellations may affect your ability to book future sessions.'
    },
    {
        category: 'Sessions',
        q: 'Can I be both a student and a tutor?',
        a: 'Yes. Once you\'re an approved tutor, you can switch between Student and Tutor roles from your account menu in the top navigation. As a tutor you still have full access to all student resources. Many of our tutors use the platform to study for their own classes too.'
    },
    {
        category: 'Safety & Privacy',
        q: 'What if a tutor is a no-show or the session goes poorly?',
        a: 'Use the Contact page to report the issue directly to our team. You can also leave a review after any completed session. Tutors with consistently low ratings or repeated no-shows are reviewed by the leadership team and may have their tutor status revoked. Student feedback is what keeps quality high on this platform.'
    },
    {
        category: 'Safety & Privacy',
        q: 'Is my personal information private?',
        a: 'Yes. Your email address is never displayed publicly. Only your first name and last initial appear on your profile. Session history is visible only to you and platform admins. We do not share student data with third parties. All communications happen through the platform\'s built-in chat system, so no personal contact info is ever exchanged.'
    },
];

const categories = ['All', ...new Set(faqs.map(f => f.category))];

function FAQ() {
    const [open, setOpen] = useState(null);
    const [category, setCategory] = useState('All');

    const filtered = category === 'All' ? faqs : faqs.filter(f => f.category === category);

    return (
        <div className="faq-page">
            <div className="faq-header">
                <div className="faq-badge">FAQ</div>
                <h1>Frequently Asked Questions</h1>
                <p>Everything you need to know about Equalizer. Can't find your answer? <Link to="/contact">Contact us</Link>.</p>
            </div>

            <div className="faq-categories">
                {categories.map(c => (
                    <button
                        key={c}
                        className={`faq-cat-btn ${category === c ? 'active' : ''}`}
                        onClick={() => { setCategory(c); setOpen(null); }}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <div className="faq-list">
                {filtered.map((item, i) => (
                    <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
                        <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                            <span>{item.q}</span>
                            <span className="faq-chevron">{open === i ? '-' : '+'}</span>
                        </button>
                        {open === i && (
                            <div className="faq-answer">{item.a}</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="faq-footer-cta">
                <p>Still have questions?</p>
                <Link to="/contact" className="faq-contact-btn">Get in Touch</Link>
            </div>
        </div>
    );
}

export default FAQ;
