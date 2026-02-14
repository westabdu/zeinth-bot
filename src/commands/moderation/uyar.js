// commands/uyar.js - Otomatik ceza desteği
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";
import Guild from "../../models/Guild.js";

export const data = {
    name: "uyar",
    description: "Kullanıcıya uyarı verir veya uyarılarını görürsünüz.",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Üyeleri Sustur` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const sub = interaction.options.getSubcommand();
            const user = interaction.options.getUser('kullanici');
            const key = `warns_${interaction.guild.id}_${user.id}`;

            if (sub === "ekle") {
                const sebep = interaction.options.getString('sebep') || "Belirtilmedi";
                let warns = await db.get(key) || [];
                warns.push({ 
                    sebep, 
                    admin: interaction.user.tag, 
                    tarih: new Date().toLocaleDateString('tr-TR') 
                });
                await db.set(key, warns);

                // Otomatik ceza kontrolü
                await checkAndApplyPunishment(interaction, user, warns.length);

                return interaction.reply({ content: `✅ **${user.tag}** uyarıldı. (Toplam: ${warns.length})` });
            }

            if (sub === "bak") {
                let warns = await db.get(key) || [];
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle(`📋 ${user.tag} Uyarıları`)
                    .setDescription(`${user.tag} kullanıcısının **${warns.length}** uyarısı var.`);
                
                warns.forEach((w, i) => {
                    embed.addFields({ 
                        name: `Uyarı #${i+1}`, 
                        value: `**Sebep:** ${w.sebep}\n**Yetkili:** ${w.admin}\n**Tarih:** ${w.tarih}`, 
                        inline: true 
                    });
                });
                
                return interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Uyar komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

// Otomatik ceza uygulama fonksiyonu
async function checkAndApplyPunishment(interaction, user, warnCount) {
    try {
        const guild = interaction.guild;
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        const guildSettings = await Guild.findOne({ guildId: guild.id });
        if (!guildSettings?.warnThresholds) return;

        const thresholds = guildSettings.warnThresholds;
        let action = null;
        let duration = null;

        if (warnCount >= thresholds.ban) {
            action = 'ban';
        } else if (warnCount >= thresholds.mute) {
            action = 'mute';
            duration = thresholds.muteDuration;
        } else {
            return;
        }

        if (action === 'mute' && member.moderatable) {
            await member.timeout(duration, `Otomatik mute: ${warnCount} uyarıya ulaştı.`);
            const msg = `🔇 **${user.tag}**, ${warnCount} uyarıya ulaştığı için otomatik mute yedi. (${duration/60000} dakika)`;
            await sendLog(guild, thresholds.logChannel, msg);
        } else if (action === 'ban' && member.bannable) {
            await member.ban({ reason: `Otomatik ban: ${warnCount} uyarıya ulaştı.` });
            const msg = `🔨 **${user.tag}**, ${warnCount} uyarıya ulaştığı için otomatik ban yedi.`;
            await sendLog(guild, thresholds.logChannel, msg);
        }
    } catch (error) {
        console.error('❌ Otomatik ceza hatası:', error);
    }
}

async function sendLog(guild, channelId, message) {
    if (!channelId) return;
    const channel = guild.channels.cache.get(channelId);
    if (channel?.isTextBased()) {
        channel.send(message).catch(() => {});
    }
}

export const slash_data = new SlashCommandBuilder()
    .setName("uyar")
    .setDescription("Uyarı sistemi")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(s => 
        s.setName("ekle")
            .setDescription("Kullanıcıya yeni bir uyarı ekler.")
            .addUserOption(o => o.setName("kullanici").setDescription("Uyarılacak kullanıcıyı seçin.").setRequired(true))
            .addStringOption(o => o.setName("sebep").setDescription("Uyarı sebebini belirtin.").setRequired(false)))
    .addSubcommand(s => 
        s.setName("bak")
            .setDescription("Kullanıcının geçmiş uyarılarını listeler.")
            .addUserOption(o => o.setName("kullanici").setDescription("Uyarılarına bakılacak kullanıcıyı seçin.").setRequired(true)));