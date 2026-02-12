import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "log-ayarla",
    description: "Log kanalını ayarlar.",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const kanal = interaction.options.getChannel("kanal");
            
            if (!kanal.isTextBased()) {
                return interaction.reply({ content: "❌ Lütfen geçerli bir yazı kanalı seçin!", ephemeral: true });
            }

            db.set(`logChannel_${interaction.guild.id}`, kanal.id);

            await interaction.reply({ 
                content: `✅ Log kanalı başarıyla ${kanal} olarak ayarlandı!`, 
                ephemeral: true 
            });

            try {
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Log Sistemi Aktif!")
                    .setDescription("Artık moderasyon logları bu kanala düşecek.\n\n**Loglanacak olaylar:**\n• Mesaj silinmesi\n• Mesaj düzenlenmesi")
                    .setTimestamp();

                await kanal.send({ embeds: [embed] });
            } catch (err) {
                console.error("Log kanalına mesaj gönderilemedi:", err);
            }
        } catch (error) {
            console.error("❌ Log-ayarla komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("log-ayarla")
    .setDescription("Log kanalını belirler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => 
        option.setName("kanal")
            .setDescription("Logların gideceği kanal")
            .setRequired(true));