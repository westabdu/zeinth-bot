import User from "../models/User.js";
import Guild from "../models/Guild.js";

const db = {
    get: async (key) => {
        // Kullanıcı verileri (Ekonomi, XP vb.)
        if (key.startsWith("stats_")) {
            const [_, guildId, userId] = key.split("_");
            const data = await User.findOne({ guildId, userId });
            return data ? data.toObject() : null;
        } 
        // Loto ve Kayıt Sistemi verileri (Sunucu bazlı)
        if (key.startsWith("lotto_") || key.startsWith("kayit_") || key.startsWith("kayitli_kullanicilar_")) {
            const guildId = key.split("_")[key.startsWith("kayit_panel") ? 2 : 2] || key.split("_")[1];
            const data = await Guild.findOne({ guildId });
            // Kayıt sistemi verileri registrationData içinde saklanıyor varsayalım
            if (key.startsWith("kayit_")) return data?.registrationData?.[key] || null;
            if (key.startsWith("lotto_")) return data?.lotto || { total: 0, tickets: [] };
            if (key.startsWith("kayitli_kullanicilar_")) return data?.kayitliListe || [];
        }
        return null;
    },

    set: async (key, value) => {
        const options = { upsert: true, returnDocument: 'after' }; // 🚨 Mongoose uyarısı çözüldü

        if (key.startsWith("stats_")) {
            const [_, guildId, userId] = key.split("_");
            return await User.findOneAndUpdate({ guildId, userId }, value, options);
        }
        
        if (key.startsWith("kayit_")) {
            const guildId = key.split("_")[2];
            return await Guild.findOneAndUpdate(
                { guildId }, 
                { $set: { [`registrationData.${key}`]: value } }, 
                options
            );
        }

        if (key.startsWith("kayitli_kullanicilar_")) {
            const guildId = key.split("_")[2];
            return await Guild.findOneAndUpdate({ guildId }, { kayitliListe: value }, options);
        }

        if (key.startsWith("lotto_")) {
            const guildId = key.split("_")[1];
            return await Guild.findOneAndUpdate({ guildId }, { lotto: value }, options);
        }
    },

    all: async () => {
        const result = [];
        const users = await User.find({});
        users.forEach(user => {
            result.push({ id: `stats_${user.guildId}_${user.userId}`, data: user.toObject() });
        });
        return result; // 🚨 Artık Promise.all kullanmana gerek yok, direkt array döner
    }
};

export default db;