// events/messageCreate.js
import db from "../utils/database.js";
import Guild from "../models/Guild.js";

export default client => {
    client.on("messageCreate", async message => {
        try {
            if (message.author.bot || !message.guild) return;

            // 🛡️ OTOMATİK MODERASYON KONTROLLERİ
            const settings = await Guild.findOne({ guildId: message.guild.id });
            
            // Yönetici ve yetkilileri etkileme
            if (message.member.permissions.has("ManageMessages")) return;

            // --- ANTI-LINK ---
            if (settings?.automod?.antiLink) {
                const linkPatterns = ["discord.gg/", "http://", "https://", "www."];
                if (linkPatterns.some(pattern => message.content.toLowerCase().includes(pattern))) {
                    await message.delete().catch(() => {});
                    const reply = await message.channel.send(`⚠️ **${message.author.username}**, link paylaşımı yasak!`);
                    return setTimeout(() => reply.delete().catch(() => {}), 3000);
                }
            }

            // --- KÜFÜR ENGEL ---
            if (settings?.automod?.antiBadWords) {
                const badWords = settings.bannedWords || ["küfür1", "küfür2"];
                if (badWords.some(word => message.content.toLowerCase().includes(word))) {
                    await message.delete().catch(() => {});
                    const reply = await message.channel.send(`🤫 **${message.author.username}**, üslubuna dikkat et!`);
                    return setTimeout(() => reply.delete().catch(() => {}), 3000);
                }
            }

        } catch (error) {
            console.error("❌ MessageCreate hatası:", error);
        }
    });
};