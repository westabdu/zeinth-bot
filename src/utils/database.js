import User from "../models/User.js";
import Guild from "../models/Guild.js"; // Loto gibi sunucu verileri için

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
            return await User.findOneAndUpdate({ guildId, userId }, value, { upsert: true, new: true });
        }
        if (key.startsWith("lotto_")) {
            const guildId = key.split("_")[1];
            return await Guild.findOneAndUpdate({ guildId }, { lotto: value }, { upsert: true, new: true });
        }
    }
};

export default db;