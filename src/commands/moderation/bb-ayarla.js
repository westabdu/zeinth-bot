import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "bb-ayarla",
    description: "Görüşürüz (çıkış) sistemini tek komutla kurun.",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const kanal = interaction.options.getChannel('kanal');
            const mesaj = interaction.options.getString('mesaj');
            
            // ✅ guildId TANIMLANDI!
            const guildId = interaction.guild.id;

            if (!kanal.isTextBased()) {
                return interaction.reply({ content: "❌ Lütfen geçerli bir yazı kanalı seçin!", ephemeral: true });
            }

            // ✅ await EKLENDİ!
            await db.set(`bb_sistemi_${guildId}`, {
                kanalId: kanal.id,
                mesaj: mesaj
            });

            return interaction.reply({ 
                content: `✅ **Çıkış sistemi başarıyla kuruldu!**\n📍 **Kanal:** <#${kanal.id}>\n💬 **Mesaj:** ${mesaj}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error("❌ Bb-ayarla komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("bb-ayarla")
    .setDescription("Görüşürüz kanalını ve mesajını aynı anda ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt => 
        opt.setName("kanal")
            .setDescription("Mesajların gideceği kanalı seçin.")
            .setRequired(true))
    .addStringOption(opt => 
        opt.setName("mesaj")
            .setDescription("{user} ve {sunucu} etiketlerini kullanabilirsiniz.")
            .setRequired(true));