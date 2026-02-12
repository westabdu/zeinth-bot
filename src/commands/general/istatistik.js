import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "istatistik",
    description: "Sunucunun detaylı istatistiklerini gösterir.",
    async execute(interaction) {
        try {
            const { guild } = interaction;
            const { members, channels, roles, premiumTier, premiumSubscriptionCount } = guild;

            const toplamUye = guild.memberCount;
            const botlar = members.cache.filter(m => m.user.bot).size;
            const insanlar = toplamUye - botlar;

            const metinKanalları = channels.cache.filter(c => c.type === 0).size;
            const sesKanalları = channels.cache.filter(c => c.type === 2).size;
            const kategoriler = channels.cache.filter(c => c.type === 4).size;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`📊 ${guild.name} - Sunucu İstatistikleri`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '👥 Üyeler', value: `**Toplam:** ${toplamUye}\n**İnsan:** ${insanlar}\n**Bot:** ${botlar}`, inline: true },
                    { name: '💬 Kanallar', value: `**Metin:** ${metinKanalları}\n**Ses:** ${sesKanalları}\n**Kategori:** ${kategoriler}`, inline: true },
                    { name: '✨ Takviye Durumu', value: `**Seviye:** ${premiumTier}\n**Takviye:** ${premiumSubscriptionCount}`, inline: true },
                    { name: '🛠️ Diğer', value: `**Rol Sayısı:** ${roles.cache.size}\n**Emoji Sayısı:** ${guild.emojis.cache.size}`, inline: true }
                )
                .setFooter({ text: `Sorgulayan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ İstatistik komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("istatistik")
    .setDescription("Sunucu hakkında detaylı bilgi verir.");