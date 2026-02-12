import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const data = {
    name: "ping",
    description: "Botun Ve Discordun Gecikmesini Gösterir",
        
    execute(interaction) {
        try {
            const discord_ping = interaction.client.ws.ping;
            const bot_ping = Date.now() - interaction.createdTimestamp;

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .addFields(
                    { name: "Discord Gecikmesi", value: `${discord_ping} ms`, inline: true },
                    { name: "Bot Gecikmesi", value: `${bot_ping} ms`, inline: true },
                );

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Ping komutu hatası:", error);
            interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName(data.name)
    .setDescription(data.description);