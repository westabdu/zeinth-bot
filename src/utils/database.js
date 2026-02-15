// src/utils/database.js
import User from "../models/User.js";
import Guild from "../models/Guild.js";

const db = {
    get: async (key) => {
        // 🟢 KULLANICI VERİLERİ (stats_GUILDID_USERID)
        if (key.startsWith("stats_")) {
            const parts = key.split("_");
            const guildId = parts[1];
            const userId = parts[2];
            const data = await User.findOne({ guildId, userId });
            return data ? data.toObject() : null;
        }
        
        // 🟢 SUNUCU VE KAYIT AYARLARI
        const guildSettings = [
            "hg_sistemi_", "bb_sistemi_", "logChannel_", "otorol_", 
            "level_ayar_", "level_roles_", "automod", "warnThresholds", 
            "kayit_roller_", "kayit_panel_", "kayitli_kullanicilar_", "rollog_", "lotto_"
        ];

        if (guildSettings.some(s => key.startsWith(s))) {
            // ID'yi her zaman en sondan alıyoruz (Hata buradaydı, pop() ile çözdük)
            const parts = key.split("_");
            const guildId = parts[parts.length - 1]; 
            const guildData = await Guild.findOne({ guildId });
            
            if (!guildData) return null;
            
            // Özel durumlar
            if (key.startsWith("lotto_")) return guildData.lotto || { total: 0, tickets: [] };
            if (key.startsWith("kayitli_kullanicilar_")) return guildData.kayitliKullanicilar || [];
            
            // Kayıt paneli özel (kayit_panel_PANELID_GUILDID formatı için)
            if (key.startsWith("kayit_panel_")) {
                const panelId = parts[2];
                return guildData.kayitPanelleri?.[panelId] || null;
            }
            
            // Diğer tüm ayarlar (hg_sistemi, kayit_roller vb.)
            const keyName = parts[0] + (parts[1] !== guildId ? "_" + parts[1] : ""); 
            // ^ Burada 'kayit_roller' ismini tam olarak yakalıyoruz.
            
            return guildData[keyName] || null;
        }
        return null;
    },

    set: async (key, value) => {
        const options = { upsert: true, returnDocument: 'after' };

        // 🟢 KULLANICI VERİLERİ
        if (key.startsWith("stats_")) {
            const parts = key.split("_");
            return await User.findOneAndUpdate({ guildId: parts[1], userId: parts[2] }, value, options);
        }

        // 🟢 SUNUCU VE KAYIT AYARLARI
        const parts = key.split("_");
        const guildId = parts[parts.length - 1];
        const keyName = parts[0] + (parts[1] !== guildId ? "_" + parts[1] : "");

        let updateData = {};
        
        if (key.startsWith("lotto_")) updateData = { lotto: value };
        else if (key.startsWith("kayitli_kullanicilar_")) updateData = { kayitliKullanicilar: value };
        else if (key.startsWith("kayit_panel_")) {
            const panelId = parts[2];
            updateData = { [`kayitPanelleri.${panelId}`]: value };
        }
        else {
            updateData = { [keyName]: value };
        }
        
        return await Guild.findOneAndUpdate({ guildId }, { $set: updateData }, options);
    },

    all: async () => {
        const result = [];
        const users = await User.find({});
        users.forEach(user => result.push({ id: `stats_${user.guildId}_${user.userId}`, data: user.toObject() }));
        
        const guilds = await Guild.find({});
        guilds.forEach(guild => {
            if (guild.kayit_roller) result.push({ id: `kayit_roller_${guild.guildId}`, data: guild.kayit_roller });
            if (guild.kayitliKullanicilar) result.push({ id: `kayitli_kullanicilar_${guild.guildId}`, data: guild.kayitliKullanicilar });
            // ... diğerlerini de benzer şekilde ekleyebilirsin
        });
        return result;
    }
};

export default db;