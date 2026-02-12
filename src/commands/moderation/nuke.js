import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = {
    name: "nuke",
    description: "Kanaldaki tüm mesajları siler (Kanalı yeniden oluşturur).",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Kanalları Yönet` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const channel = interaction.channel;
            await channel.clone().then(c => {
                c.setPosition(channel.position);
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setDescription("🚀 Kanal başarıyla nuke'lendi!")
                    .setTimestamp();
                c.send({ embeds: [embed] });
            });
            await channel.delete();
        } catch (error) {
            console.error("❌ Nuke komutu hatası:", error);
            if (!interaction.replied) {
                return interaction.reply({ content: "❌ Kanal nuke'lenirken bir hata oluştu!", ephemeral: true });
            }
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("Kanalı sıfırlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);