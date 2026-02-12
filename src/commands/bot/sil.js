import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = {
    name: "sil",
    description: "Belirtilen miktarda mesajı kanaldan temizler.",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const miktar = interaction.options.getInteger('miktar');

            if (miktar < 1 || miktar > 100) {
                return interaction.reply({ content: "❌ Bir kerede en az 1, en fazla 100 mesaj silebilirsin!", ephemeral: true });
            }

            const messages = await interaction.channel.bulkDelete(miktar, true);
            const silinenSayisi = messages.size;
            const eskiMesajVarmi = miktar > silinenSayisi;

            let rapor = `🧹 **${silinenSayisi}** adet mesaj başarıyla silindi.`;
            if (eskiMesajVarmi) {
                rapor += `\n⚠️ Not: **${miktar - silinenSayisi}** mesaj 14 günden eski olduğu için Discord kuralları gereği silinemedi.`;
            }

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(rapor)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            setTimeout(() => interaction.deleteReply().catch(() => null), 5000);
        } catch (error) {
            console.error("❌ Sil komutu hatası:", error);
            return interaction.reply({ content: "❌ Mesajlar silinirken bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("sil")
    .setDescription("Belirtilen miktarda mesajı kanaldan temizler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => 
        option.setName('miktar')
            .setDescription('Silinecek mesaj sayısını girin (1-100).')
            .setRequired(true));