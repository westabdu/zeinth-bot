import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const data = {
    name: "kilit",
    description: "Kanalı yazıya kapatır veya açar.",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Kanalları Yönet` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const durum = interaction.options.getString('durum');
            const channel = interaction.channel;

            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: durum === "kilit" ? false : true
            });

            return interaction.reply({ 
                content: `🔒 Kanal başarıyla **${durum === "kilit" ? "kilitlendi" : "açıldı"}**!` 
            });
        } catch (error) {
            console.error("❌ Kilit komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("kilit")
    .setDescription("Kanalı kilitler/açar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(opt => opt.setName("durum").setDescription("Kilit durumu").setRequired(true)
        .addChoices(
            { name: "Kilitle", value: "kilit" },
            { name: "Aç", value: "ac" }
        ));