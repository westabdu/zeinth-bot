import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../models/Guild.js';

export const slash_data = new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Otomatik moderasyon sistemini ayarlar')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('ozellik')
            .setDescription('Açmak veya kapatmak istediğiniz özellik')
            .setRequired(true)
            .addChoices(
                { name: 'Link Engelleyici', value: 'antiLink' },
                { name: 'Küfür Engelleyici', value: 'antiBadWords' },
                 { name: 'Capslock Engelleyici', value: 'antiCapslock' } // ✨ YENİ!
            ))
    .addBooleanOption(option =>
        option.setName('durum')
            .setDescription('Aktif mi pasif mi?')
            .setRequired(true));

export const data = {
    name: "automod",
    execute: async (interaction) => {
        const feature = interaction.options.getString('ozellik');
        const status = interaction.options.getBoolean('durum');

        // Veritabanında güncelleme yap
        await Guild.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { [`automod.${feature}`]: status } },
            { upsert: true, new: true }
        );

        return interaction.reply({
            embeds: [interaction.client.embed(`✅ **${feature}** özelliği başarıyla **${status ? 'Açıldı' : 'Kapatıldı'}**!`, status ? "yesil" : "sari")]
        });
    }
};