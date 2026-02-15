import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "level-top",
    description: "Sunucudaki level sıralamasını gösterir.",
    
    async execute(interaction) {
        try {
            // Önce defer dene, olmazsa reply ile devam et
            let deferred = false;
            try {
                await interaction.deferReply();
                deferred = true;
            } catch (e) {
                // defer başarısız, reply kullanacağız
                deferred = false;
            }
            
            const guildId = interaction.guild.id;
            const page = interaction.options.getInteger('sayfa') || 1;
            const itemsPerPage = 10;
            
            const allKeys = await db.all().catch(() => []);
            const guildKeys = allKeys.filter(item => 
                item && item.id && 
                typeof item.id === 'string' &&
                item.id.startsWith(`stats_${guildId}_`) && 
                item.data && 
                item.data.msg_lv !== undefined
            );
            
            const sortedUsers = guildKeys.sort((a, b) => {
                const totalXpA = (a.data.msg_lv * 500) + a.data.msg_xp;
                const totalXpB = (b.data.msg_lv * 500) + b.data.msg_xp;
                return totalXpB - totalXpA;
            });
            
            const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageUsers = sortedUsers.slice(startIndex, endIndex);
            
            let leaderboardText = "";
            for (let i = 0; i < pageUsers.length; i++) {
                const userData = pageUsers[i];
                const userId = userData.id.split('_')[2];
                const user = await interaction.guild.members.fetch(userId).catch(() => null);
                const username = user ? user.user.username : `Bilinmeyen (${userId})`;
                const totalXP = (userData.data.msg_lv * 500) + userData.data.msg_xp;
                
                let emoji = "🔹";
                if (i === 0) emoji = "🥇";
                else if (i === 1) emoji = "🥈";
                else if (i === 2) emoji = "🥉";
                
                leaderboardText += `**${startIndex + i + 1}. ${emoji} ${username}**\n`;
                leaderboardText += `   Level: ${userData.data.msg_lv} • XP: ${totalXP.toLocaleString()}\n`;
                leaderboardText += `   Toplam Mesaj: ${userData.data.total_messages || 0}\n\n`;
            }
            
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`🏆 ${interaction.guild.name} Level Sıralaması`)
                .setDescription(leaderboardText || "📭 Henüz kimse level kazanmamış!")
                .addFields(
                    { name: "📊 İstatistikler", value: `Toplam Kullanıcı: ${sortedUsers.length}\nToplam Sayfa: ${totalPages}`, inline: true },
                    { name: "📈 Ortalama Level", value: calculateAverageLevel(sortedUsers), inline: true }
                )
                .setFooter({ text: `Sayfa ${page}/${totalPages} • ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setLabel('◀️ Önceki')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page <= 1),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Sonraki ▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page >= totalPages)
            );
            
            // deferred durumuna göre cevap ver
            if (deferred) {
                await interaction.editReply({ embeds: [embed], components: [buttons] });
            } else {
                await interaction.reply({ embeds: [embed], components: [buttons] });
            }
        } catch (error) {
            console.error("❌ Level-top komutu hatası:", error);
            
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ content: "❌ Bir hata oluştu! Lütfen daha sonra tekrar dene." });
                } else {
                    await interaction.reply({ content: "❌ Bir hata oluştu! Lütfen daha sonra tekrar dene.", ephemeral: true });
                }
            } catch (e) {}
        }
    }
};

function calculateAverageLevel(users) {
    if (users.length === 0) return "0";
    const totalLevel = users.reduce((sum, user) => sum + user.data.msg_lv, 0);
    return (totalLevel / users.length).toFixed(1);
}

export const slash_data = new SlashCommandBuilder()
    .setName("level-top")
    .setDescription("Sunucudaki level sıralamasını gösterir.")
    .addIntegerOption(opt => 
        opt.setName("sayfa")
            .setDescription("Gösterilecek sayfa (varsayılan: 1)")
            .setRequired(false)
            .setMinValue(1));