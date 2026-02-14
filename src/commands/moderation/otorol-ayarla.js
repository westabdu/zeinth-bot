import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "otorol-ayarla",
    description: "Yeni gelenlere otomatik verilecek rolü ayarlar.",
    async execute(interaction) {  // ✅ interaction parametresi OLMALI!
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const rol = interaction.options.getRole('rol');
            
            // ✅ guildId tanımlandı!
            const guildId = interaction.guild.id;
            
            // ✅ await eklendi!
            await db.set(`otorol_${guildId}`, rol.id);
            
            return interaction.reply({ 
                content: `✅ Otomatik rol <@&${rol.id}> olarak ayarlandı!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error("❌ Otorol-ayarla komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("otorol-ayarla")
    .setDescription("Otorol sistemini ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(opt => opt.setName("rol").setDescription("Verilecek rolü seçin").setRequired(true));