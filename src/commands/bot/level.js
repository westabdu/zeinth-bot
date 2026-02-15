import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "level",
    description: "Seviyenizi ve sıranızı gösterir",
    
    async execute(interaction) {
        try {
            await interaction();
            
            const targetUser = interaction.options.getUser("kullanıcı") || interaction.user;
            const guildId = interaction.guild.id;
            const key = `stats_${guildId}_${targetUser.id}`;
            
            // 🔁 await eklendi
            let levelData = await db.get(key);
            if (!levelData) {
                levelData = { 
                    msg_xp: 0, 
                    msg_lv: 1, 
                    voice_xp: 0, 
                    voice_lv: 1,
                    total_messages: 0,
                    total_voice: 0
                };
                // 🔁 await eklendi
                await db.set(key, levelData);
            }
            
            // 🔁 await eklendi (db.all asenkron)
            const allKeys = await db.all();
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
            
            const rank = sortedUsers.findIndex(item => item.id === key) + 1
            
            // XP hesaplamaları
            const currentLevel = levelData.msg_lv;
            const currentXP = levelData.msg_xp;
            const xpNeeded = currentLevel * 500;
            const xpProgress = ((currentXP / xpNeeded) * 100).toFixed(1);
            
            // Progress bar oluştur (görsel için)
            const progressBarLength = 15;
            const filledBars = Math.floor((currentXP / xpNeeded) * progressBarLength);
            const emptyBars = progressBarLength - filledBars;
            const progressBar = `██`.repeat(filledBars) + `░░`.repeat(emptyBars);
            
            // Renk belirle (level'a göre)
            let embedColor = 0x5865F2; // Discord mavisi
            if (currentLevel >= 50) embedColor = 0xFFD700; // Altın
            else if (currentLevel >= 30) embedColor = 0x9B59B6; // Mor
            else if (currentLevel >= 20) embedColor = 0x3498DB; // Mavi
            else if (currentLevel >= 10) embedColor = 0x2ECC71; // Yeşil
            
            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setAuthor({ 
                    name: `${targetUser.username} Seviye Bilgisi`, 
                    iconURL: targetUser.displayAvatarURL() 
                })
                .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
                .setDescription(`
🏆 **Sıralama:** #${rank} / ${guildKeys.length}
🎯 **Level:** ${currentLevel} (${currentXP} / ${xpNeeded} XP)
📊 **İlerleme:** ${xpProgress}%

${progressBar} ${xpProgress}%

⚡ **Sonraki Level:** ${xpNeeded - currentXP} XP kaldı
                `)
                .addFields(
                    { 
                        name: "💬 Mesaj Seviyesi", 
                        value: `**Level ${currentLevel}**\n${currentXP} / ${xpNeeded} XP`, 
                        inline: true 
                    },
                    { 
                        name: "🎤 Ses Seviyesi", 
                        value: `**Level ${levelData.voice_lv || 1}**\n${levelData.voice_xp || 0} / ${(levelData.voice_lv || 1) * 500} XP`, 
                        inline: true 
                    },
                    { 
                        name: "📊 Toplam İstatistik", 
                        value: `**Toplam Mesaj:** ${levelData.total_messages || 0}\n**Toplam Ses:** ${levelData.total_voice || 0} dakika`, 
                        inline: true 
                    }
                )
                .setFooter({ 
                    text: `${interaction.guild.name} Level Sistemi`, 
                    iconURL: interaction.guild.iconURL() 
                })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error("❌ Level komutu hatası:", error);
            await interaction.editReply({ 
                content: "❌ Bir hata oluştu! Lütfen daha sonra tekrar dene." 
            }).catch(() => {});
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("level")
    .setDescription("Seviyenizi ve sıranızı gösterir")
    .addUserOption(option =>
        option.setName("kullanıcı")
            .setDescription("Hangi kullanıcının seviyesini görmek istersin?")
            .setRequired(false));