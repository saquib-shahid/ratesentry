import { Router } from 'express';
import { Tier, Client, Rule } from '../services/db.service.js';
import { configService } from '../services/config.service.js';
export const adminRouter = Router();
// Stats
adminRouter.get('/stats', async (req, res) => {
    const clientCount = await Client.countDocuments();
    const ruleCount = await Rule.countDocuments();
    res.json({
        clients: clientCount,
        rules: ruleCount,
    });
});
// Clients
adminRouter.get('/clients', async (req, res) => {
    const clients = await Client.find().populate('tierId');
    // Map tierId to tier for the frontend
    const mapped = clients.map((c) => ({
        id: c._id,
        name: c.name,
        apiKey: c.apiKey,
        tier: c.tierId,
        rules: []
    }));
    res.json(mapped);
});
adminRouter.post('/clients', async (req, res) => {
    const { name, tierId } = req.body;
    const apiKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    const newClient = await Client.create({
        name,
        apiKey,
        tierId
    });
    res.json({ id: newClient._id, ...newClient.toObject() });
});
// Tiers
adminRouter.get('/tiers', async (req, res) => {
    const tiers = await Tier.find();
    const mapped = tiers.map((t) => ({ id: t._id, name: t.name, requestsPerMin: t.requestsPerMin }));
    res.json(mapped);
});
adminRouter.post('/tiers', async (req, res) => {
    const { name, requestsPerMin } = req.body;
    const newTier = await Tier.create({ name, requestsPerMin });
    await configService.refreshCache();
    res.json({ id: newTier._id, ...newTier.toObject() });
});
// Rules
adminRouter.get('/rules', async (req, res) => {
    const rules = await Rule.find().populate('clientId');
    const mapped = rules.map((r) => ({
        id: r._id,
        type: r.type,
        ipAddress: r.ipAddress,
        clientId: r.clientId ? r.clientId._id || r.clientId : null
    }));
    res.json(mapped);
});
adminRouter.post('/rules', async (req, res) => {
    const { type, ipAddress, clientId } = req.body;
    const newRule = await Rule.create({ type, ipAddress, clientId: clientId || null });
    await configService.refreshCache();
    res.json({ id: newRule._id, ...newRule.toObject() });
});
adminRouter.delete('/rules/:id', async (req, res) => {
    await Rule.findByIdAndDelete(req.params.id);
    await configService.refreshCache();
    res.json({ success: true });
});
//# sourceMappingURL=admin.js.map