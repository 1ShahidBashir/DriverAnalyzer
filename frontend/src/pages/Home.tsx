import { useFeatureFlags } from '../store/AppContext';
import type { FeatureFlags } from '../store/AppContext';
import FeedbackForm from '../components/FeedbackForm';
import { Car, Map, Smartphone, ShieldCheck, Zap, Brain, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface FeedbackConfig {
    key: keyof FeatureFlags;
    type: 'driver' | 'trip' | 'app' | 'marshal';
    title: string;
    icon: ReactNode;
}

const feedbackConfigs: FeedbackConfig[] = [
    { key: 'driverFeedback', type: 'driver', title: 'Driver Feedback', icon: <Car className="w-6 h-6 text-primary-light" /> },
    { key: 'tripFeedback', type: 'trip', title: 'Trip Feedback', icon: <Map className="w-6 h-6 text-cyan-400" /> },
    { key: 'appFeedback', type: 'app', title: 'App Feedback', icon: <Smartphone className="w-6 h-6 text-accent" /> },
    { key: 'marshalFeedback', type: 'marshal', title: 'Marshal Feedback', icon: <ShieldCheck className="w-6 h-6 text-success" /> },
];

export default function Home() {
    const { featureFlags: flags, loading } = useFeatureFlags();

    const enabledForms = feedbackConfigs.filter((cfg) => flags[cfg.key]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Hero */}
            <div className="text-center mb-14">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-primary-light via-accent to-primary bg-clip-text text-transparent">
                        Driver Sentiment Engine
                    </span>
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                    Help us improve our service by sharing your experience. Your feedback drives real-time insights.
                </p>
            </div>

            {/* Live stats bar */}
            <div className="flex justify-center gap-8 mb-12">
                {[
                    { label: 'Real-time Processing', value: '< 100ms', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
                    { label: 'Sentiment Analysis', value: 'AFINN-165', icon: <Brain className="w-4 h-4 text-purple-400" /> },
                    { label: 'EMA Updates', value: 'O(1)', icon: <TrendingUp className="w-4 h-4 text-cyan-400" /> },
                ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 text-sm text-text-secondary">
                        {stat.icon}
                        <span className="text-text-primary font-medium">{stat.value}</span>
                        <span>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Feedback forms grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : enabledForms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enabledForms.map((cfg) => (
                        <FeedbackForm key={cfg.type} feedbackType={cfg.type} title={cfg.title} icon={cfg.icon} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-text-secondary">
                    <p className="text-xl">No feedback forms are currently enabled.</p>
                </div>
            )}
        </div>
    );
}
