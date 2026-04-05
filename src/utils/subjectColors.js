export const SUBJECT_COLORS = {
    algebra:     '#1e40af',
    geometry:    '#7c3aed',
    calculus:    '#059669',
    trigonometry:'#dc2626',
    statistics:  '#d97706',
};

export const DEFAULT_COLOR = '#081040';

export const getSubjectColor = (topic = '') => {
    const t = topic.toLowerCase();
    for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
        if (t.includes(key)) return color;
    }
    return DEFAULT_COLOR;
};

export const subjects = [
    { name: 'Algebra',      icon: 'A', color: SUBJECT_COLORS.algebra },
    { name: 'Geometry',     icon: 'G', color: SUBJECT_COLORS.geometry },
    { name: 'Calculus',     icon: 'C', color: SUBJECT_COLORS.calculus },
    { name: 'Trigonometry', icon: 'T', color: SUBJECT_COLORS.trigonometry },
    { name: 'Statistics',   icon: 'S', color: SUBJECT_COLORS.statistics },
];
