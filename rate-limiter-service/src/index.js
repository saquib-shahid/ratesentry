"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const metrics_service_1 = require("./services/metrics.service");
const admin_1 = require("./routes/admin");
const config_service_1 = require("./services/config.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Expose Prometheus Metrics
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metrics_service_1.metricsRegister.contentType);
        res.end(await metrics_service_1.metricsRegister.metrics());
    }
    catch (err) {
        res.status(500).end(err);
    }
});
// Register Admin Endpoints
app.use('/admin', admin_1.adminRouter);
// Simple Healthcheck
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Start checking the DB configuration cache properly when the app boots
config_service_1.configService.refreshCache().then(() => {
    console.log('Tier and Rule config cache populated initially.');
});
app.listen(PORT, () => {
    console.log(`Rate Limiter Service is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map