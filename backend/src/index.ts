import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { Database } from './config/Database';
import { AfinnSentimentAnalyzer } from './strategies/AfinnSentimentAnalyzer';
import { MetricsService } from './services/MetricsService';
import { FeedbackWorker } from './queue/FeedbackWorker';
import feedbackRoutes from './routes/feedbackRoutes';
import configRoutes from './routes/configRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Bootstrap
async function bootstrap(): Promise<void> {
    try {
        // 1. Connect to MongoDB (Singleton)
        const db = Database.getInstance();
        await db.connect();

        // 2. Start the background worker with injected dependencies
        const sentimentAnalyzer = new AfinnSentimentAnalyzer();
        const metricsService = new MetricsService();
        const _worker = new FeedbackWorker(sentimentAnalyzer, metricsService);

        // 3. Start Express server using http.createServer to keep the event loop alive
        const server = http.createServer(app);
        server.listen(PORT, () => {
            console.log(`\n🚀 Driver Sentiment Engine running on http://localhost:${PORT}`);
            console.log(`📊 API Endpoints:`);
            console.log(`   POST /api/feedback         → Submit feedback (202 Accepted)`);
            console.log(`   GET  /api/config/features   → Feature flags`);
            console.log(`   POST /api/admin/login       → Admin login`);
            console.log(`   GET  /api/admin/analytics   → Driver analytics (JWT required)`);
            console.log(`   GET  /api/health            → Health check\n`);
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down...');
            server.close();
            await db.disconnect();
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to bootstrap application:', error);
        process.exit(1);
    }
}

bootstrap();
