// commands/uyar-ayarla.js
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import Guild from "../../models/Guild.js";

export const data = {
    name: "uyar-ayarla",
    description: "Otomatik uyarı sistemini ayarlar.",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const muteEsik = interaction.options.getInteger('mute_esik');
            const banEsik = interaction.options.getInteger('ban_esik');
            const muteSure = interaction.options.getInteger('mute_sure'); // dakika
            const logKanal = interaction.options.getChannel('log_kanal');

            // Güncelleme objesi
            const update = {};
            if (muteEsik) update['warnThresholds.mute'] = muteEsik;
            if (banEsik) update['warnThresholds.ban'] = banEsik;
            if (muteSure) update['warnThresholds.muteDuration'] = muteSure * 60 * 1000;
            if (logKanal) update['warnThresholds.logChannel'] = logKanal.id;

            await Guild.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { $set: update },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Uyarı Sistemi Ayarları Güncellendi")
                .addFields(
                    { name: "Mute Eşiği", value: muteEsik ? `**${muteEsik}** uyarı` : "Değişmedi", inline: true },
                    { name: "Ban Eşiği", value: banEsik ? `**${banEsik}** uyarı` : "Değişmedi", inline: true },
                    { name: "Mute Süresi", value: muteSure ? `**${muteSure}** dakika` : "Değişmedi", inline: true },
                    { name: "Log Kanalı", value: logKanal ? `<#${logKanal.id}>` : "Değişmedi", inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error("❌ Uyar-ayarla komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("uyar-ayarla")
    .setDescription("Otomatik uyarı sistemini ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(opt => opt.setName("mute_esik").setDescription("Kaç uyarıda mute? (varsayılan: 3)").setMinValue(1).setRequired(false))
    .addIntegerOption(opt => opt.setName("ban_esik").setDescription("Kaç uyarıda ban? (varsayılan: 5)").setMinValue(1).setRequired(false))
    .addIntegerOption(opt => opt.setName("mute_sure").setDescription("Mute süresi (dakika)").setMinValue(1).setRequired(false))
    .addChannelOption(opt => opt.setName("log_kanal").setDescription("Otomatik ceza log kanalı").setRequired(false));