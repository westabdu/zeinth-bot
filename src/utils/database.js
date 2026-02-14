// src/utils/database.js
import User from "../models/User.js";
import Guild from "../models/Guild.js";

const db = {
    get: async (key) => {
        if (key.startsWith("stats_")) {
            const [_, guildId, userId] = key.split("_");
            const data = await User.findOne({ guildId, userId });
            return data ? data.toObject() : null;
        } 
        if (key.startsWith("lotto_")) {
            const guildId = key.split("_")[1];
            const data = await Guild.findOne({ guildId });
            return data?.lotto || { total: 0, tickets: [] };
        }
        return null;
    },

    set: async (key, value) => {
        if (key.startsWith("stats_")) {
            const [_, guildId, userId] = key.split("_");
            return await User.findOneAndUpdate(
                { guildId, userId }, 
                value, 
                { upsert: true, new: true }
            );
        }
        if (key.startsWith("lotto_")) {
            const guildId = key.split("_")[1];
            return await Guild.findOneAndUpdate(
                { guildId }, 
                { lotto: value }, 
                { upsert: true, new: true }
            );
        }
    },

    // ✨ YENİ: all() fonksiyonu
    all: async () => {
        const result = [];
        
        // Tüm kullanıcıları getir
        const users = await User.find({});
        users.forEach(user => {
            result.push({
                id: `stats_${user.guildId}_${user.userId}`,
                data: user.toObject()
            });
        });
        
        // Loto verilerini de ekleyebilirsin (istersen)
        
        return result;
    },

    // ✨ YENİ: delete fonksiyonu (istersen)
    delete: async (key) => {
        if (key.startsWith("stats_")) {
            const [_, guildId, userId] = key.split("_");
            return await User.deleteOne({ guildId, userId });
        }
        if (key.startsWith("lotto_")) {
            const guildId = key.split("_")[1];
            return await Guild.updateOne(
                { guildId },
                { $unset: { lotto: 1 } }
            );
        }
    }
};

export default db;