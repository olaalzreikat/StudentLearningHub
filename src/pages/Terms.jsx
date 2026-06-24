import { Link } from 'react-router-dom';
import './Legal.css';

const sections = [
    {
        id: 'acceptance',
        tag: 'Agreement',
        title: 'Acceptance of Terms',
        content: (
            <>
                <p>By accessing or using the Equalizer Learning Hub platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
                <p>These terms apply to all visitors, students, tutors, and other users. The Platform is school-sponsored and operated by the Equalizer student leadership team with faculty advisor oversight.</p>
            </>
        )
    },
    {
        id: 'eligibility',
        tag: 'Who Can Use',
        title: 'Eligibility',
        content: (
            <>
                <p>The Platform is intended for enrolled students and approved tutors at participating schools. By using this Platform you confirm that:</p>
                <ul>
                    <li>You are a currently enrolled student or an approved tutor affiliated with a participating school.</li>
                    <li>You will use the Platform only for educational and tutoring purposes.</li>
                    <li>You will provide accurate information when creating your account or submitting an application.</li>
                </ul>
            </>
        )
    },
    {
        id: 'accounts',
        tag: 'Your Account',
        title: 'Account Responsibilities',
        content: (
            <>
                <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to:</p>
                <ul>
                    <li>Keep your password secure and not share it with others.</li>
                    <li>Notify us immediately if you suspect unauthorized access to your account.</li>
                    <li>Ensure your profile information remains accurate and up to date.</li>
                </ul>
                <p>Accounts are for individual use only. Sharing accounts between students is not permitted.</p>
            </>
        )
    },
    {
        id: 'sessions',
        tag: 'Tutoring',
        title: 'Tutoring Sessions',
        content: (
            <>
                <p>All tutoring sessions are arranged and tracked through the Platform. By booking a session you agree to:</p>
                <ul>
                    <li>Attend at the scheduled time or cancel at least 24 hours in advance.</li>
                    <li>Behave respectfully toward your tutor or student during every session.</li>
                    <li>Confirm session completion so that service hours are accurately recorded.</li>
                </ul>
                <div className="legal-highlight">Repeated last-minute cancellations (less than 24 hours notice) may result in temporary suspension of booking privileges.</div>
                <p>Tutors are students volunteering their time in exchange for verified service hours, not monetary compensation. Soliciting payment outside the Platform is not permitted.</p>
            </>
        )
    },
    {
        id: 'conduct',
        tag: 'Community',
        title: 'User Conduct',
        content: (
            <>
                <p>You agree not to use the Platform to:</p>
                <ul>
                    <li>Harass, bully, or demean any other student or tutor.</li>
                    <li>Share personal contact information (phone number, personal email, social handles) to circumvent the Platform's communication system.</li>
                    <li>Post or transmit content that is offensive, discriminatory, or inappropriate for a school setting.</li>
                    <li>Misrepresent your identity, qualifications, or session attendance.</li>
                    <li>Attempt to access, modify, or disrupt any part of the Platform's systems or data.</li>
                </ul>
                <p>Violations may result in account suspension or permanent removal at the discretion of the leadership team and faculty advisor.</p>
            </>
        )
    },
    {
        id: 'content',
        tag: 'IP',
        title: 'Content and Intellectual Property',
        content: (
            <>
                <p>All educational content on the Platform, including video lessons, practice quizzes, and study guides, is created by or licensed to Equalizer Learning Hub for student use only.</p>
                <p>You may not reproduce, distribute, or republish Platform content outside of your personal study without written permission. User-submitted content (session notes, chat messages) remains the property of the submitting user, but by submitting it you grant the Platform a limited license to store and display it as needed for the service.</p>
            </>
        )
    },
    {
        id: 'hours',
        tag: 'Service Hours',
        title: 'Service Hours and Certificates',
        content: (
            <>
                <p>Tutor service hours are calculated based on confirmed session records on the Platform. Hours are not granted for sessions that are not confirmed by both parties.</p>
                <div className="legal-highlight">Service Hour Certificates generated by the Platform are based on recorded session data. It is your responsibility to verify the accuracy of your records before submitting certificates to your school or NHS chapter.</div>
                <p>Equalizer Learning Hub is not responsible for how third parties (schools, NHS chapters, colleges) treat or evaluate service hour certificates.</p>
            </>
        )
    },
    {
        id: 'privacy',
        tag: 'Data',
        title: 'Privacy',
        content: (
            <>
                <p>Your use of the Platform is also governed by our <Link to="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference. Please review it to understand how we collect, use, and protect your information.</p>
            </>
        )
    },
    {
        id: 'changes',
        tag: 'Updates',
        title: 'Changes to These Terms',
        content: (
            <>
                <p>We may update these Terms from time to time. When we do, the "Last Updated" date at the top of this page will be revised. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.</p>
                <p>We will make reasonable efforts to notify users of significant changes via an in-app notice.</p>
            </>
        )
    },
    {
        id: 'contact',
        tag: 'Help',
        title: 'Contact',
        content: (
            <>
                <p>If you have questions about these Terms of Service, please reach out through our <Link to="/contact">Contact page</Link>. Our leadership team will respond within 2-3 school days.</p>
            </>
        )
    },
];

function Terms() {
    return (
        <div className="legal-page">
            <header className="legal-hero" aria-label="Terms of Service header">
                <div className="legal-hero-inner">
                    <div className="legal-badge">Legal</div>
                    <h1>Terms of Service</h1>
                    <p className="legal-hero-sub">
                        By using Equalizer Learning Hub you agree to these terms. Please read them carefully.
                    </p>
                    <div className="legal-updated">
                        <span className="legal-updated-dot" aria-hidden="true" />
                        Last updated: June 2026
                    </div>
                </div>
            </header>

            <main className="legal-content" id="terms-content" aria-label="Terms of Service content">
                <nav className="legal-toc" aria-label="Table of contents">
                    <span className="legal-toc-title">Contents</span>
                    {sections.map(s => (
                        <a key={s.id} href={`#${s.id}`}>{s.title}</a>
                    ))}
                </nav>

                {sections.map((s, i) => (
                    <section key={s.id} id={s.id} className="legal-section" aria-labelledby={`terms-h-${s.id}`}>
                        <div className="legal-section-header">
                            <div className="legal-section-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
                            <div>
                                <span className="legal-section-tag">{s.tag}</span>
                                <h2 id={`terms-h-${s.id}`}>{s.title}</h2>
                            </div>
                        </div>
                        {s.content}
                    </section>
                ))}

                <div className="legal-cta" role="complementary" aria-label="Related pages">
                    <h3>Questions or concerns?</h3>
                    <p>Our team is happy to clarify anything in these terms.</p>
                    <div className="legal-cta-links">
                        <Link to="/contact" className="legal-cta-btn primary">Contact Us</Link>
                        <Link to="/privacy" className="legal-cta-btn ghost">Privacy Policy</Link>
                        <Link to="/faq" className="legal-cta-btn ghost">FAQ</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Terms;
