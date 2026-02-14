import { SlashCommandBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "afk",
    description: "AFK moduna girmenizi sağlar.",
    async execute(interaction) {
        try {
            const sebep = interaction.options.getString('sebep') || "Şu an uzaktayım.";
            const user = interaction.user;

            // 🔁 await eklendi
            await db.set(`afk_${interaction.guild.id}_${user.id}`, {
                sebep: sebep,
                zaman: Date.now()
            });

            if (interaction.member.manageable) {
                interaction.member.setNickname(`[AFK] ${interaction.user.username}`).catch(() => null);
            }

            return interaction.reply({ content: `✅ Başarıyla AFK moduna girdin. Sebep: **${sebep}**`, ephemeral: true });
        } catch (error) {
            console.error("❌ AFK komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("afk")
    .setDescription("AFK moduna girersiniz.")
    .addStringOption(opt => opt.setName("sebep").setDescription("Neden AFK olduğunuzu belirtin."));