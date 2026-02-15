import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "queue",
    description: "Sıradaki şarkıları gösterir",
    
    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        
        if (!queue) {
            return interaction.reply({ 
                content: "❌ Sırada şarkı yok!", 
                ephemeral: true 
            });
        }
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("🎵 Şarkı Sırası")
            .setDescription(
                queue.songs.map((song, index) => 
                    `${index === 0 ? "**Şu an çalıyor:**" : `**${index}.**`} ${song.name} - \`${song.formattedDuration}\``
                ).join("\n")
            )
            .setFooter({ text: `Toplam ${queue.songs.length} şarkı` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Sıradaki şarkıları gösterir");