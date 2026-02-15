// src/utils/database.js
import User from "../models/User.js";
import Guild from "../models/Guild.js";

const db = {
    get: async (key) => {
        // 🟢 KULLANICI VERİLERİ (stats_)
        if (key.startsWith("stats_")) {
            const [_, guildId, userId] = key.split("_");
            const data = await User.findOne({ guildId, userId });
            return data ? data.toObject() : null;
        }
        
        // 🟢 SUNUCU AYARLARI (hg_sistemi_, bb_sistemi_, logChannel_, otorol_, level_ayar_, level_roles_, automod, warnThresholds, kayit_roller_, kayit_panel_, kayitli_kullanicilar_, rollog_)
        if (key.startsWith("hg_sistemi_") || 
            key.startsWith("bb_sistemi_") || 
            key.startsWith("logChannel_") || 
            key.startsWith("otorol_") || 
            key.startsWith("level_ayar_") || 
            key.startsWith("level_roles_") || 
            key.startsWith("automod") || 
            key.startsWith("warnThresholds") ||
            key.startsWith("kayit_roller_") ||
            key.startsWith("kayit_panel_") ||
            key.startsWith("kayitli_kullanicilar_") ||
            key.startsWith("rollog_") ||
            key.startsWith("lotto_")) {
            
            const guildId = key.split("_")[key.startsWith("kayit_panel_") ? 2 : 1];
            const guildData = await Guild.findOne({ guildId });
            
            if (!guildData) return null;
            
            // Lotto özel
            if (key.startsWith("lotto_")) return guildData.lotto || { total: 0, tickets: [] };
            
            // Kayıtlı kullanıcılar özel
            if (key.startsWith("kayitli_kullanicilar_")) return guildData.kayitliKullanicilar || [];
            
            // Kayıt paneli özel
            if (key.startsWith("kayit_panel_")) {
                const panelId = key.split("_")[2];
                return guildData.kayitPanelleri?.[panelId] || null;
            }
            
            // Diğer tüm ayarlar için, key'in tamamını Guild modelinde saklayalım
            // Örneğin: "hg_sistemi_123456789" anahtarı, guildData.hg_sistemi olarak tutulacak
            const keyName = key.split("_")[0]; // hg, bb, logChannel, otorol vs.
            return guildData[keyName] || null;
        }
        
        return null;
    },

    set: async (key, value) => {
        const options = { upsert: true, returnDocument: 'after' };

        // 🟢 KULLANICI VERİLERİ
        if (key.startsWith("stats_")) {
            const [_, guildId, userId] = key.split("_");
            return await User.findOneAndUpdate({ guildId, userId }, value, options);
        }

        // 🟢 SUNUCU AYARLARI
        if (key.startsWith("hg_sistemi_") || 
            key.startsWith("bb_sistemi_") || 
            key.startsWith("logChannel_") || 
            key.startsWith("otorol_") || 
            key.startsWith("level_ayar_") || 
            key.startsWith("level_roles_") || 
            key.startsWith("automod") || 
            key.startsWith("warnThresholds") ||
            key.startsWith("kayit_roller_") ||
            key.startsWith("kayit_panel_") ||
            key.startsWith("kayitli_kullanicilar_") ||
            key.startsWith("rollog_") ||
            key.startsWith("lotto_")) {
            
            const guildId = key.split("_")[key.startsWith("kayit_panel_") ? 2 : 1];
            const keyName = key.split("_")[0]; // hg, bb, logChannel, otorol, level, rollog, lotto vs.
            
            let updateData = {};
            
            // Lotto özel
            if (key.startsWith("lotto_")) {
                updateData = { lotto: value };
            }
            // Kayıtlı kullanıcılar özel
            else if (key.startsWith("kayitli_kullanicilar_")) {
                updateData = { kayitliKullanicilar: value };
            }
            // Kayıt paneli özel
            else if (key.startsWith("kayit_panel_")) {
                const panelId = key.split("_")[2];
                updateData = { [`kayitPanelleri.${panelId}`]: value };
            }
            // Diğer tüm ayarlar (hg_sistemi, bb_sistemi, logChannel, otorol, level_ayar, level_roles, automod, warnThresholds, rollog)
            else {
                updateData = { [keyName]: value };
            }
            
            return await Guild.findOneAndUpdate({ guildId }, { $set: updateData }, options);
        }
        
        return null;
    },

    all: async () => {
        const result = [];
        
        // Kullanıcıları ekle
        const users = await User.find({});
        users.forEach(user => {
            result.push({ id: `stats_${user.guildId}_${user.userId}`, data: user.toObject() });
        });
        
        // Sunucu ayarlarını da ekle (opsiyonel, gerekirse)
        const guilds = await Guild.find({});
        guilds.forEach(guild => {
            // Her bir ayar için ayrı ayrı result'a ekleyebiliriz
            if (guild.hg_sistemi) result.push({ id: `hg_sistemi_${guild.guildId}`, data: guild.hg_sistemi });
            if (guild.bb_sistemi) result.push({ id: `bb_sistemi_${guild.guildId}`, data: guild.bb_sistemi });
            if (guild.logChannel) result.push({ id: `logChannel_${guild.guildId}`, data: guild.logChannel });
            if (guild.otorol) result.push({ id: `otorol_${guild.guildId}`, data: guild.otorol });
            if (guild.level_ayar) result.push({ id: `level_ayar_${guild.guildId}`, data: guild.level_ayar });
            if (guild.level_roles) result.push({ id: `level_roles_${guild.guildId}`, data: guild.level_roles });
            if (guild.automod) result.push({ id: `automod_${guild.guildId}`, data: guild.automod });
            if (guild.warnThresholds) result.push({ id: `warnThresholds_${guild.guildId}`, data: guild.warnThresholds });
            if (guild.kayit_roller) result.push({ id: `kayit_roller_${guild.guildId}`, data: guild.kayit_roller });
            if (guild.kayitliKullanicilar) result.push({ id: `kayitli_kullanicilar_${guild.guildId}`, data: guild.kayitliKullanicilar });
            if (guild.rollog) result.push({ id: `rollog_${guild.guildId}`, data: guild.rollog });
            if (guild.lotto) result.push({ id: `lotto_${guild.guildId}`, data: guild.lotto });
        });
        
        return result;
    }
};

export default db;