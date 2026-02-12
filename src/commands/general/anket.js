import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export const data = {
    name: "anket",
    description: "Sunucuda oylama başlatır.",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const soru = interaction.options.getString("soru");

            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("📢 Yeni Anket!")
                .setDescription(`**${soru}**`)
                .setFooter({ text: `${interaction.user.username} tarafından başlatıldı.`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const anketMesaji = await interaction.channel.send({ embeds: [embed] });
            
            await anketMesaji.react("✅");
            await anketMesaji.react("❌");

            await interaction.reply({ content: "✅ Anket başarıyla oluşturuldu!", ephemeral: true });
        } catch (error) {
            console.error("❌ Anket komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("anket")
    .setDescription("Sunucuda oylama başlatır")
    .addStringOption(option => 
        option.setName("soru")
            .setDescription("Anket sorusu nedir?")
            .setRequired(true));