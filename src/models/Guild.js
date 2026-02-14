import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    automod: {
        antiLink: { type: Boolean, default: false },
        antiSpam: { type: Boolean, default: false },
        antiBadWords: { type: Boolean, default: false },
        antiCapslock: { type: Boolean, default: false }, // ✨ YENİ!
        logChannel: { type: String, default: null }
    },
    
    // SUNUCUYA ÖZEL KELİME FİLTRESİ
    bannedWords: { type: Array, default: [] },
        warnThresholds: {
        type: {
            mute: { type: Number, default: 3 },      // Kaç uyarıda mute?
            ban: { type: Number, default: 5 },       // Kaç uyarıda ban?
            muteDuration: { type: Number, default: 3600000 }, // 1 saat (ms)
            logChannel: { type: String, default: null }
        },
        default: { mute: 3, ban: 5, muteDuration: 3600000 }
    }
});

export default mongoose.model('Guild', guildSchema);