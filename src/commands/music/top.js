import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "top",
    description: "En çok dinlenen şarkıları gösterir",
    
    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ 
                content: "❌ Sırada şarkı yok!", 
                ephemeral: true 
            });
        }
        
        // İstatistik topla (bu örnek için basit)
        const songCounts = {};
        queue.songs.forEach(song => {
            songCounts[song.name] = (songCounts[song.name] || 0) + 1;
        });
        
        const sorted = Object.entries(songCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle("📊 En Çok Dinlenenler")
            .setDescription(
                sorted.map(([name, count], i) => 
                    `**${i+1}.** ${name} - **${count} kez**`
                ).join("\n")
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("top")
    .setDescription("En çok dinlenen şarkıları gösterir");