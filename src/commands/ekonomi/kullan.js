import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "kullan",
    description: "Envanterindeki bir eşyayı kullan.",
    async execute(interaction) {
        try {
            const itemId = interaction.options.getString("eşya");
            const guildId = interaction.guild.id;
            const userId = interaction.user.id;
            const userKey = `stats_${guildId}_${userId}`;
            
            let userData = await db.get(userKey);
            if (!userData?.inventory) return interaction.reply({ content: "📭 Envanterin boş!", ephemeral: true });

            const itemIndex = userData.inventory.findIndex(i => i.id === itemId && !i.used);
            if (itemIndex === -1) return interaction.reply({ content: "❌ Bu eşya envanterinde yok veya zaten kullanılmış.", ephemeral: true });

            const item = userData.inventory[itemIndex];
            let result = "";

            if (item.id === "xp_boost") {
                if (!userData.boosts) userData.boosts = [];
                userData.boosts.push({ type: "xp", multiplier: 2, expires: Date.now() + 60 * 60 * 1000 });
                result = "⚡ 1 saat boyunca **2x XP** kazanacaksın!";
                item.used = true;
            } else if (item.id === "double_daily") {
                userData.daily_multiplier = 2;
                userData.daily_multiplier_expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
                result = "📆 7 gün boyunca **günlük ödülün 2 katı**!";
                item.used = true;
            } else if (item.id === "transfer_tax_free") {
                if (!userData.perks) userData.perks = [];
                userData.perks.push({ type: "tax_free_transfer", used: false });
                result = "💸 Bir sonraki transferinde **komisyon ödemeyeceksin**!";
                item.used = true;
            } else {
                return interaction.reply({ content: "❌ Bu eşya kullanılamaz.", ephemeral: true });
            }

            await db.set(userKey, userData);
            await interaction.reply({ content: `✅ **${item.name}** kullanıldı!\n${result}`, ephemeral: true });
        } catch (error) {
            console.error("❌ Kullan komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("kullan")
    .setDescription("Envanterindeki bir eşyayı kullan")
    .addStringOption(opt => opt.setName("eşya").setDescription("Kullanılacak eşyanın ID'si").setRequired(true));