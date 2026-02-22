import { useState } from 'react';
import type { ReactNode } from 'react';
import { submitFeedback } from '../services/api';
import type { FeedbackPayload } from '../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

interface FeedbackFormProps {
    feedbackType: 'driver' | 'trip' | 'app' | 'marshal';
    title: string;
    icon: ReactNode;
}

export default function FeedbackForm({ feedbackType, title, icon }: FeedbackFormProps) {
    const [driverId, setDriverId] = useState('');
    const [text, setText] = useState('');
    const [rating, setRating] = useState(3);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const payload: FeedbackPayload = { driverId, feedbackType, text, rating };
            await submitFeedback(payload);
            setStatus('success');
            setMessage('Feedback submitted successfully!');
            setDriverId('');
            setText('');
            setRating(3);
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Submission failed');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="group relative rounded-2xl border border-primary/15 bg-surface-card backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
            {/* Gradient glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{icon}</span>
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Driver ID</label>
                        <input
                            type="text"
                            value={driverId}
                            onChange={(e) => setDriverId(e.target.value)}
                            required
                            placeholder="e.g. D001"
                            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-primary/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Feedback</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                            rows={3}
                            placeholder="Share your experience..."
                            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-primary/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setRating(val)}
                                    className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${rating >= val
                                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 scale-110'
                                        : 'bg-surface border border-primary/20 text-text-secondary hover:border-primary/40'
                                        }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'submitting' ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Submitting...
                            </span>
                        ) : 'Submit Feedback'}
                    </button>

                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-success text-sm bg-success/10 p-3 rounded-xl animate-fade-in">
                            <CheckCircle className="w-4 h-4" /> {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 p-3 rounded-xl animate-fade-in">
                            <XCircle className="w-4 h-4" /> {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
