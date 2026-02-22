import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AppContext';
import { getAnalytics } from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { Users, MessageSquare, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface DriverMetric {
    driverId: string;
    emaScore: number;
    totalFeedbackCount: number;
    updatedAt: string;
}

interface Alert {
    driverId: string;
    emaScore: number;
    message: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState<DriverMetric[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/admin/login');
            return;
        }

        getAnalytics()
            .then((res) => {
                setMetrics(res.data.data.metrics || []);
                setAlerts(res.data.data.alerts || []);
            })
            .catch((err) => {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                }
            })
            .finally(() => setLoading(false));
    }, [auth.isAuthenticated, navigate]);

    const chartData = metrics.map((m) => ({
        driver: m.driverId,
        ema: Math.round(m.emaScore * 100) / 100,
        feedbacks: m.totalFeedbackCount,
    }));

    const avgEma = metrics.length
        ? (metrics.reduce((a, m) => a + m.emaScore, 0) / metrics.length).toFixed(2)
        : '0.00';

    const totalFeedbacks = metrics.reduce((a, m) => a + m.totalFeedbackCount, 0);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Analytics Dashboard
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[
                    { label: 'Total Drivers', value: metrics.length, icon: <Users className="w-6 h-6" />, color: 'from-primary to-primary-dark' },
                    { label: 'Total Feedbacks', value: totalFeedbacks, icon: <MessageSquare className="w-6 h-6" />, color: 'from-accent to-accent-dark' },
                    { label: 'Avg EMA Score', value: avgEma, icon: <TrendingUp className="w-6 h-6" />, color: 'from-success to-green-700' },
                    { label: 'Active Alerts', value: alerts.length, icon: <AlertTriangle className="w-6 h-6" />, color: 'from-danger to-red-700' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-primary/15 bg-surface-card p-5 hover:border-primary/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-text-secondary">{stat.icon}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${stat.color} text-white`}>
                                Live
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        <p className="text-sm text-text-secondary">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* EMA Line Chart */}
                <div className="rounded-2xl border border-primary/15 bg-surface-card p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Driver EMA Scores</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                                <XAxis dataKey="driver" stroke="#94a3b8" fontSize={12} />
                                <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e1b4b',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        borderRadius: '12px',
                                        color: '#f1f5f9',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ema"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, fill: '#06b6d4' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-text-secondary">
                            No data yet. Submit some feedback first!
                        </div>
                    )}
                </div>

                {/* Feedback Count Bar Chart */}
                <div className="rounded-2xl border border-primary/15 bg-surface-card p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Feedback Volume</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                                <XAxis dataKey="driver" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e1b4b',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        borderRadius: '12px',
                                        color: '#f1f5f9',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="feedbacks" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Feedbacks" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-text-secondary">
                            No data yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Alerts Table */}
            {alerts.length > 0 && (
                <div className="rounded-2xl border border-danger/20 bg-surface-card p-6">
                    <h3 className="text-lg font-semibold text-danger mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Recent Alerts
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-primary/15">
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Driver</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">EMA Score</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Message</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert, idx) => (
                                    <tr key={idx} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                                        <td className="py-3 px-4 font-medium text-text-primary">{alert.driverId}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 bg-danger/20 text-danger rounded-lg text-xs font-medium">
                                                {alert.emaScore.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-text-secondary">{alert.message}</td>
                                        <td className="py-3 px-4 text-text-secondary">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Drivers detail table */}
            {metrics.length > 0 && (
                <div className="rounded-2xl border border-primary/15 bg-surface-card p-6 mt-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Driver Metrics Detail</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-primary/15">
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Driver ID</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">EMA Score</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Total Feedbacks</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Last Updated</th>
                                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map((m) => (
                                    <tr key={m.driverId} className="border-b border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => navigate(`/admin/driver/${m.driverId}`)}>
                                        <td className="py-3 px-4 font-medium text-text-primary">{m.driverId}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-lg text-xs font-medium ${m.emaScore >= 3.5
                                                    ? 'bg-success/20 text-success'
                                                    : m.emaScore >= 2.5
                                                        ? 'bg-warning/20 text-warning'
                                                        : 'bg-danger/20 text-danger'
                                                    }`}
                                            >
                                                {m.emaScore.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-text-secondary">{m.totalFeedbackCount}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-lg text-xs font-medium ${m.emaScore >= 3.5
                                                    ? 'bg-success/20 text-success'
                                                    : m.emaScore >= 2.5
                                                        ? 'bg-warning/20 text-warning'
                                                        : 'bg-danger/20 text-danger'
                                                    }`}
                                            >
                                                {m.emaScore >= 3.5 ? 'Good' : m.emaScore >= 2.5 ? 'Warning' : 'Critical'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-text-secondary">
                                            {new Date(m.updatedAt).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                to={`/admin/driver/${m.driverId}`}
                                                className="px-3 py-1 rounded-lg text-xs font-medium bg-primary/20 text-primary-light hover:bg-primary/30 transition-colors inline-flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Details <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
