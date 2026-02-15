// models/Guild.js
import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    
    // HG / BB Sistemleri
    hg_sistemi: { type: Object, default: null },
    bb_sistemi: { type: Object, default: null },
    
    // Log ve Otorol
    logChannel: { type: String, default: null },
    otorol: { type: String, default: null },
    rollog: { type: String, default: null },
    
    // Level Sistemi
    level_ayar: { type: Object, default: null },
    level_roles: { type: Object, default: null },
    
    // AutoMod
    automod: {
        antiLink: { type: Boolean, default: false },
        antiSpam: { type: Boolean, default: false },
        antiBadWords: { type: Boolean, default: false },
        antiCapslock: { type: Boolean, default: false },
        logChannel: { type: String, default: null }
    },
    
    // Uyarı Sistemi
    warnThresholds: {
        mute: { type: Number, default: 3 },
        ban: { type: Number, default: 5 },
        muteDuration: { type: Number, default: 3600000 },
        logChannel: { type: String, default: null }
    },
    
    // Kayıt Sistemi
    kayit_roller: { type: Object, default: null },
    kayitliKullanicilar: { type: Array, default: [] },
    kayitPanelleri: { type: Object, default: {} },
    
    // Loto
    lotto: { type: Object, default: null },
    
    // Yasaklı kelimeler
    bannedWords: { type: Array, default: [] }
});

export default mongoose.model('Guild', guildSchema);