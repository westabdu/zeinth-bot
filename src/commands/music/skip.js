import { SlashCommandBuilder } from "discord.js";

export const data = {
    name: "skip",
    description: "Çalan şarkıyı geçer",
    
    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        
        if (!queue) {
            return interaction.reply({ 
                content: "❌ Şu anda çalan bir şarkı yok!", 
                ephemeral: true 
            });
        }
        
        try {
            const song = await queue.skip();
            await interaction.reply({ 
                content: `⏭️ **${song.name}** geçildi!` 
            });
        } catch (error) {
            console.error("❌ Skip hatası:", error);
            await interaction.reply({ 
                content: "❌ Şarkı geçilirken hata oluştu!", 
                ephemeral: true 
            });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Çalan şarkıyı geçer");