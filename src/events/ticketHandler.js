import { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default client => {
    client.on('interactionCreate', async interaction => {
        try {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'ticket_olustur') {
                await interaction.deferReply({ ephemeral: true });

                const kanal = await interaction.guild.channels.create({
                    name: `destek-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                        { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                    ]
                });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_kapat')
                        .setLabel('Talebi Kapat')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Danger)
                );

                await kanal.send({ 
                    content: `${interaction.user} Hoş geldin! Yetkililer birazdan seninle ilgilenecek.`, 
                    components: [row] 
                });

                return interaction.editReply({ content: `✅ Destek talebin oluşturuldu: ${kanal}` });
            }

            if (interaction.customId === 'ticket_kapat') {
                if (!interaction.channel.name.includes('destek')) return;
                await interaction.reply("🔒 Ticket 5 saniye içinde siliniyor...");
                setTimeout(() => {
                    interaction.channel.delete().catch(() => null);
                }, 5000);
            }
        } catch (error) {
            console.error("❌ Ticket sistemi hatası:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true }).catch(() => {});
            }
        }
    });
};