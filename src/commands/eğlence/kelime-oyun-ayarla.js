import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "kelime-oyun-ayarla",
    description: "Kelime oyunu kanalını belirler.",
    async execute(interaction) {
        try {
            const kanal = interaction.options.getChannel('kanal');
            db.set(`kelime_kanal_${interaction.guild.id}`, kanal.id);
            db.set(`kelime_oyun_${interaction.guild.id}`, {
                sonKelime: "elma",
                sonKullanici: null,
                toplamKelime: 0,
                skorlar: {}
            });
            
            return interaction.reply({ 
                content: `✅ Kelime oyunu kanalı <#${kanal.id}> olarak ayarlandı! Oyun **"elma"** kelimesi ile başladı!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error("❌ Kelime-oyun-ayarla hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("kelime-oyun-ayarla")
    .setDescription("Kelime oyunu kanalını ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o => o.setName("kanal").setDescription("Kanalı seçin").setRequired(true));