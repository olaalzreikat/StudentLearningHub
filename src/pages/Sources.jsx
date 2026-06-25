import './Legal.css';
import './Sources.css';

const sources = [
    {
        category: 'Video Content',
        items: [
            { title: 'Introduction to Algebra', author: 'Khan Academy', url: 'https://www.youtube.com/watch?v=grnP3mduZkM', accessed: 'June 2026' },
            { title: 'Solving Linear Equations', author: 'Khan Academy', url: 'https://www.youtube.com/watch?v=Ft2_QtXAnh8', accessed: 'June 2026' },
            { title: 'Variables and Expressions', author: 'Khan Academy', url: 'https://www.youtube.com/watch?v=Qa-MCLDrSlI', accessed: 'June 2026' },
            { title: 'Quadratic Equations Explained', author: 'Khan Academy', url: 'https://www.youtube.com/watch?v=i7idZfS8t8w', accessed: 'June 2026' },
            { title: 'Polynomial Functions', author: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=Vm7H0VTlIco', accessed: 'June 2026' },
            { title: 'Geometry: Angles and Lines', author: 'Khan Academy', url: 'https://www.youtube.com/watch?v=AE3Pqhlvgf0', accessed: 'June 2026' },
            { title: 'The Pythagorean Theorem', author: 'Khan Academy', url: 'https://www.youtube.com/watch?v=AA6RfgP-AHU', accessed: 'June 2026' },
            { title: 'Introduction to Limits', author: 'Khan Academy', url: 'https://www.youtube.com/watch?v=riXcZT2ICjA', accessed: 'June 2026' },
            { title: 'Derivatives Explained', author: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=9vKqVkMQHKk', accessed: 'June 2026' },
        ]
    },
    {
        category: 'Educational Platforms & Frameworks',
        items: [
            { title: 'Khan Academy — Free Math Curriculum', author: 'Khan Academy', url: 'https://www.khanacademy.org', accessed: 'June 2026' },
            { title: 'React Documentation', author: 'Meta / React Team', url: 'https://react.dev', accessed: 'June 2026' },
            { title: 'Firebase Documentation', author: 'Google', url: 'https://firebase.google.com/docs', accessed: 'June 2026' },
            { title: 'Vite Build Tool', author: 'Evan You', url: 'https://vitejs.dev', accessed: 'June 2026' },
        ]
    },
    {
        category: 'Design & UX Research',
        items: [
            { title: 'Web Content Accessibility Guidelines (WCAG) 2.1', author: 'W3C', url: 'https://www.w3.org/TR/WCAG21/', accessed: 'June 2026' },
            { title: 'Google Material Design Color System', author: 'Google', url: 'https://m3.material.io/styles/color', accessed: 'June 2026' },
            { title: 'Nielsen Norman Group — UX Research Articles', author: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/', accessed: 'June 2026' },
            { title: 'Core Web Vitals Overview', author: 'Google Developers', url: 'https://web.dev/vitals/', accessed: 'June 2026' },
        ]
    },
    {
        category: 'Curriculum & Content Standards',
        items: [
            { title: 'Common Core State Standards — Mathematics', author: 'Common Core State Standards Initiative', url: 'http://www.corestandards.org/Math/', accessed: 'June 2026' },
            { title: 'NCTM Principles to Actions — Mathematics Education', author: 'National Council of Teachers of Mathematics', url: 'https://www.nctm.org', accessed: 'June 2026' },
        ]
    },
];

function Sources() {
    return (
        <div className="legal-page">
            <header className="legal-hero">
                <div className="legal-hero-inner">
                    <div className="legal-badge">Transparency</div>
                    <h1>Sources &amp; References</h1>
                    <p className="legal-hero-sub">All educational content, tools, and research sources cited here.</p>
                    <div className="legal-updated">
                        <span className="legal-updated-dot" />
                        Last updated: June 2026
                    </div>
                </div>
            </header>

            <main className="legal-content">
                <div className="sources-intro">
                    <p>
                        Equalizer Learning Hub is built on a foundation of credible, publicly available educational resources.
                        All video content is embedded from platforms that allow educational embedding under their respective
                        Terms of Service. Curriculum standards are aligned to Common Core Mathematics.
                    </p>
                </div>

                {sources.map((group, gi) => (
                    <section key={gi} className="sources-group" aria-label={group.category}>
                        <h2 className="sources-category">{group.category}</h2>
                        <div className="sources-list">
                            {group.items.map((item, ii) => (
                                <div key={ii} className="source-item">
                                    <div className="source-num">{ii + 1}</div>
                                    <div className="source-info">
                                        <span className="source-title">{item.title}</span>
                                        <span className="source-meta">
                                            {item.author} &middot; Accessed {item.accessed}
                                        </span>
                                        <a
                                            href={item.url}
                                            className="source-url"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`View source: ${item.title}`}
                                        >
                                            {item.url}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                <div className="sources-note">
                    <strong>Note on Fair Use:</strong> All embedded videos are sourced from YouTube and comply with the YouTube
                    Terms of Service for educational embedding. No copyrighted content has been reproduced or redistributed
                    outside of its original platform. Logos and trademarks referenced belong to their respective owners.
                </div>
            </main>
        </div>
    );
}

export default Sources;
