import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AppContext';
import { adminLogin } from '../services/api';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await adminLogin(username, password);
            const { token } = res.data.data;
            localStorage.setItem('adminToken', token);
            setAuth({ token, username, isAuthenticated: true });
            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-primary/20 bg-surface-card backdrop-blur-sm p-8 shadow-2xl shadow-primary/10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">Admin Login</h2>
                        <p className="text-text-secondary text-sm mt-1">Access the analytics dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1.5">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-primary/20 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="admin"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-text-secondary mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-primary/20 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="text-danger text-sm bg-danger/10 p-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-text-secondary text-xs mt-6">
                        Demo credentials: admin / admin123
                    </p>
                </div>
            </div>
        </div>
    );
}
