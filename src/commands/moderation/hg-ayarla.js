import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "hg-ayarla",
    description: "Hoş geldin sistemini tek komutla kurun.",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const kanal = interaction.options.getChannel('kanal');
            const mesaj = interaction.options.getString('mesaj');
            const guildId = interaction.guild.id; // ✅ guildId tanımlandı

            if (!kanal.isTextBased()) {
                return interaction.reply({ content: "❌ Lütfen geçerli bir yazı kanalı seçin!", ephemeral: true });
            }

            await db.set(`hg_sistemi_${guildId}`, {
                kanalId: kanal.id,
                mesaj: mesaj
            });

            return interaction.reply({ 
                content: `✅ **Hoş geldin sistemi başarıyla kuruldu!**\n📍 **Kanal:** <#${kanal.id}>\n💬 **Mesaj:** ${mesaj}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error("❌ Hg-ayarla komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("hg-ayarla")
    .setDescription("Hoş geldin kanalını ve mesajını aynı anda ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt => opt.setName("kanal").setDescription("Mesajların gideceği kanal").setRequired(true))
    .addStringOption(opt => opt.setName("mesaj").setDescription("{user}, {sunucu}, {sayı} etiketlerini kullanabilirsiniz.").setRequired(true));