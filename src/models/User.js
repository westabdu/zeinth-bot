import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    
    // 💰 Ekonomi
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    inventory: { type: Array, default: [] },
    
    // 💼 İş sistemi
    job: { type: String, default: null },
    job_xp: { type: Number, default: 0 },
    job_level: { type: Number, default: 1 },
    
    // 📊 Level sistemi (EKSLER BURADAYDI!)
    msg_xp: { type: Number, default: 0 },        // ✨ YENİ
    msg_lv: { type: Number, default: 1 },        // ✅ VAR
    voice_xp: { type: Number, default: 0 },      // ✨ YENİ
    voice_lv: { type: Number, default: 1 },      // ✅ VAR
    total_messages: { type: Number, default: 0 }, // ✨ YENİ
    total_voice: { type: Number, default: 0 },    // ✨ YENİ
    
    // 📆 Günlük sistem
    total_dailies: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    last_daily: { type: String, default: null },
    daily_quests: { type: Object, default: {} },
    
    // 📈 Hisse sistemi
    stocks: { type: Object, default: {} },
    
    // 🏆 Başarımlar
    achievements: { type: Array, default: [] },
    
    // 🦊 Evcil hayvan
    pet: { type: String, default: null },
    petHappiness: { type: Number, default: 50 },
    
    // 💸 İstatistikler
    total_spent: { type: Number, default: 0 },
    total_transfers: { type: Number, default: 0 }
});

// Benzersiz index (aynı sunucuda aynı kullanıcı sadece 1 kayıt)
userSchema.index({ guildId: 1, userId: 1 }, { unique: true });

export default mongoose.model('User', userSchema);