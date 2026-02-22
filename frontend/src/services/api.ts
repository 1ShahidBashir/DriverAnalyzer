import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to admin requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface FeedbackPayload {
    driverId: string;
    feedbackType: 'driver' | 'trip' | 'app' | 'marshal';
    text: string;
    rating: number;
}

export const submitFeedback = (data: FeedbackPayload) =>
    api.post('/feedback', data);

export const adminLogin = (username: string, password: string) =>
    api.post('/admin/login', { username, password });

export const getAnalytics = () =>
    api.get('/admin/analytics');

export const getDriverDetail = (driverId: string) =>
    api.get(`/admin/drivers/${driverId}`);

export const getFeatureFlags = () =>
    api.get('/config/features');

export default api;
