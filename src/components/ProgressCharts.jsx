import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { getQuizScoresKey } from '../utils/localStorage';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || '#1e40af' }}>
                    {p.name}: {p.value}{p.unit || ''}
                </div>
            ))}
        </div>
    );
};

function ProgressCharts({ progress }) {
    // Weekly activity (last 5 weeks)
    const weeklyData = (() => {
        const activities = progress.recentActivity || [];
        const now = new Date();
        return Array.from({ length: 5 }, (_, i) => {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay() - (4 - i) * 7);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const count = activities.filter(a => {
                const t = new Date(a.timestamp);
                return t >= weekStart && t < weekEnd;
            }).length;
            return { week: label, activities: count };
        });
    })();

    // Quiz score history
    const quizScores = (() => {
        try {
            const raw = localStorage.getItem(getQuizScoresKey());
            if (!raw) return [];
            return JSON.parse(raw).slice(-10).map((e, i) => ({
                name: e.title ? e.title.replace(/Quiz$/i, '').trim() : `Quiz ${i + 1}`,
                score: e.score,
            }));
        } catch { return []; }
    })();

    return (
        <div className="progress-charts-section">
            <h2 className="section-title">Progress Charts</h2>

            <div className="chart-card">
                <h3 className="chart-title">Weekly Activity</h3>
                <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="activities" name="Resources" fill="#1e40af" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <h3 className="chart-title">Quiz Scores</h3>
                {quizScores.length === 0 ? (
                    <div className="chart-empty">Complete a quiz to see your scores here.</div>
                ) : (
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={quizScores} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="score"
                                name="Score"
                                stroke="#1e40af"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#1e40af' }}
                                unit="%"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default ProgressCharts;
