import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    inventory: { type: Array, default: [] },
    job: { type: String, default: null },
    job_xp: { type: Number, default: 0 },
    job_level: { type: Number, default: 1 },
    msg_lv: { type: Number, default: 1 },
    voice_lv: { type: Number, default: 1 },
    total_dailies: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    last_daily: { type: String, default: null },
    daily_quests: { type: Object, default: {} },
    stocks: { type: Object, default: {} },
    achievements: { type: Array, default: [] },
    pet: { type: String, default: null },
    petHappiness: { type: Number, default: 50 },
    total_spent: { type: Number, default: 0 },
    total_transfers: { type: Number, default: 0 }
});

export default mongoose.model('User', userSchema);