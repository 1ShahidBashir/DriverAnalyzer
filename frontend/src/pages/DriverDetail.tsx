import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AppContext';
import { getDriverDetail } from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, User, Activity, MessageSquare, AlertTriangle, Star } from 'lucide-react';

interface FeedbackItem {
    feedbackType: string;
    text: string;
    rating: number;
    sentimentScore: number;
    timestamp: string;
}

interface AlertItem {
    emaScore: number;
    message: string;
    timestamp: string;
}

interface DriverMetric {
    driverId: string;
    emaScore: number;
    totalFeedbackCount: number;
    lastAlertTimestamp: string | null;
    updatedAt: string;
    createdAt: string;
}

export default function DriverDetail() {
    const { driverId } = useParams<{ driverId: string }>();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState<DriverMetric | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/admin/login');
            return;
        }
        if (!driverId) return;

        getDriverDetail(driverId)
            .then((res) => {
                setMetrics(res.data.data.metrics);
                setFeedbacks(res.data.data.feedbacks || []);
                setAlerts(res.data.data.alerts || []);
            })
            .catch((err) => {
                if (err.response?.status === 404) setError('Driver not found');
                else if (err.response?.status === 401) navigate('/admin/login');
                else setError('Failed to load driver data');
            })
            .finally(() => setLoading(false));
    }, [driverId, auth.isAuthenticated, navigate]);

    // Build chart data: sentiment score over time (oldest → newest)
    const chartData = [...feedbacks].reverse().map((f, idx) => ({
        index: idx + 1,
        score: f.sentimentScore,
        rating: f.rating,
    }));

    const statusColor = !metrics
        ? 'text-text-secondary'
        : metrics.emaScore >= 3.5
            ? 'text-success'
            : metrics.emaScore >= 2.5
                ? 'text-warning'
                : 'text-danger';

    const statusLabel = !metrics
        ? '—'
        : metrics.emaScore >= 3.5
            ? 'Good'
            : metrics.emaScore >= 2.5
                ? 'Warning'
                : 'Critical';

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                <p className="text-danger text-xl mb-4">{error}</p>
                <Link to="/admin" className="text-primary hover:underline flex items-center justify-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    to="/admin"
                    className="px-3 py-2 rounded-xl bg-surface border border-primary/20 text-text-secondary hover:text-text-primary hover:border-primary/40 transition-all text-sm flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <User className="w-7 h-7 text-primary-light" />
                        Driver {driverId}
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Detailed performance &amp; feedback history
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="rounded-2xl border border-primary/15 bg-surface-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-text-secondary" />
                            <p className="text-text-secondary text-sm">EMA Score</p>
                        </div>
                        <p className={`text-3xl font-bold ${statusColor}`}>{metrics.emaScore.toFixed(2)}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/15 bg-surface-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-text-secondary" />
                            <p className="text-text-secondary text-sm">Status</p>
                        </div>
                        <p className={`text-2xl font-bold ${statusColor}`}>{statusLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/15 bg-surface-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-text-secondary" />
                            <p className="text-text-secondary text-sm">Total Feedbacks</p>
                        </div>
                        <p className="text-3xl font-bold text-text-primary">{metrics.totalFeedbackCount}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/15 bg-surface-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-text-secondary" />
                            <p className="text-text-secondary text-sm">Alerts Triggered</p>
                        </div>
                        <p className="text-3xl font-bold text-danger">{alerts.length}</p>
                    </div>
                </div>
            )}

            {/* Sentiment Trend Chart */}
            <div className="rounded-2xl border border-primary/15 bg-surface-card p-6 mb-8">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Sentiment Score Trend</h3>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                            <XAxis dataKey="index" stroke="#94a3b8" fontSize={12} label={{ value: 'Feedback #', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
                            <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e1b4b',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                    borderRadius: '12px',
                                    color: '#f1f5f9',
                                }}
                            />
                            <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} name="Sentiment" />
                            <Line type="monotone" dataKey="rating" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#06b6d4', r: 3 }} name="Rating" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[280px] flex items-center justify-center text-text-secondary">No feedback data</div>
                )}
            </div>

            {/* Feedback History Table */}
            <div className="rounded-2xl border border-primary/15 bg-surface-card p-6 mb-8">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Feedback History ({feedbacks.length})
                </h3>
                {feedbacks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-primary/15">
                                    <th className="text-left py-3 px-3 text-text-secondary font-medium">Type</th>
                                    <th className="text-left py-3 px-3 text-text-secondary font-medium">Text</th>
                                    <th className="text-left py-3 px-3 text-text-secondary font-medium">Rating</th>
                                    <th className="text-left py-3 px-3 text-text-secondary font-medium">Sentiment</th>
                                    <th className="text-left py-3 px-3 text-text-secondary font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbacks.map((fb, idx) => (
                                    <tr key={idx} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-0.5 rounded-lg text-xs bg-primary/20 text-primary-light capitalize">
                                                {fb.feedbackType}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-text-secondary max-w-md truncate">{fb.text}</td>
                                        <td className="py-3 px-3">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} className={`w-3.5 h-3.5 ${fb.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${fb.sentimentScore >= 3.5 ? 'bg-success/20 text-success'
                                                    : fb.sentimentScore >= 2.5 ? 'bg-warning/20 text-warning'
                                                        : 'bg-danger/20 text-danger'
                                                }`}>
                                                {fb.sentimentScore.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-text-secondary text-xs whitespace-nowrap">
                                            {new Date(fb.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-text-secondary py-4">No feedbacks recorded.</p>
                )}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="rounded-2xl border border-danger/20 bg-surface-card p-6">
                    <h3 className="text-lg font-semibold text-danger mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Alert History ({alerts.length})
                    </h3>
                    <div className="space-y-3">
                        {alerts.map((alert, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-danger/5 border border-danger/10">
                                <span className="text-danger font-bold text-sm mt-0.5">{alert.emaScore.toFixed(2)}</span>
                                <div className="flex-1">
                                    <p className="text-text-secondary text-sm">{alert.message}</p>
                                    <p className="text-text-secondary text-xs mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
