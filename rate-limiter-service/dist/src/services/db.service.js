import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ratelimiter';
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
    }
};
export const Tier = mongoose.model('Tier', new Schema({
    name: { type: String, unique: true, required: true },
    requestsPerMin: { type: Number, required: true }
}, { timestamps: true }));
export const Client = mongoose.model('Client', new Schema({
    apiKey: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    tierId: { type: Schema.Types.ObjectId, ref: 'Tier', required: true }
}, { timestamps: true }));
export const Rule = mongoose.model('Rule', new Schema({
    type: { type: String, required: true }, // "WHITELIST", "BLACKLIST"
    ipAddress: { type: String },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' }
}, { timestamps: true }));
//# sourceMappingURL=db.service.js.map