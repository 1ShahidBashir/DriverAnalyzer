import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AppContext';
import { Activity, LogOut, LayoutDashboard, MessageSquare, Shield } from 'lucide-react';

export default function Navbar() {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setAuth({ token: null, username: null, isAuthenticated: false });
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface/70 border-b border-primary/20">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Feedback
                    </Link>
                    {auth.isAuthenticated ? (
                        <>
                            <Link
                                to="/admin"
                                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors flex items-center gap-1.5"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/admin/login"
                            className="px-5 py-2 text-sm rounded-lg bg-primary hover:bg-primary-dark text-white transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center gap-1.5"
                        >
                            <Shield className="w-4 h-4" />
                            Admin
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
