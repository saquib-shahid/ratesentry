import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { metricsRegister } from './services/metrics.service.js';
import { adminRouter } from './routes/admin.js';
import { configService } from './services/config.service.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors());
app.use(express.json());
// Expose Prometheus Metrics
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metricsRegister.contentType);
        res.end(await metricsRegister.metrics());
    }
    catch (err) {
        res.status(500).end(err);
    }
});
import { rateLimiter } from './middleware/rateLimiter.js';
// Register Admin Endpoints
app.use('/admin', adminRouter);
// Demo Endpoint wrapped with Rate Limiter
app.get('/api/users', rateLimiter({ algorithm: 'sliding-window' }), (req, res) => {
    res.status(200).json({ data: ['Alice', 'Bob', 'Charlie'] });
});
// Simple Healthcheck
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
import { connectDB } from './services/db.service.js';
// Start checking the DB configuration cache properly when the app boots
connectDB().then(() => {
    return configService.refreshCache();
}).then(() => {
    console.log('Tier and Rule config cache populated initially.');
});
app.listen(PORT, () => {
    console.log(`Rate Limiter Service is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map