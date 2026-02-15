import { SlashCommandBuilder } from "discord.js";

export const data = {
    name: "stop",
    description: "Müziği durdurur ve sırayı temizler",
    
    async execute(interaction, client) {
        const queue = client.distube.getQueue(interaction.guildId);
        
        if (!queue) {
            return interaction.reply({ 
                content: "❌ Şu anda çalan bir şarkı yok!", 
                ephemeral: true 
            });
        }
        
        try {
            await queue.stop();
            await interaction.reply({ 
                content: "⏹️ Müzik durduruldu ve sıra temizlendi!" 
            });
        } catch (error) {
            console.error("❌ Stop hatası:", error);
            await interaction.reply({ 
                content: "❌ Müzik durdurulurken hata oluştu!", 
                ephemeral: true 
            });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Müziği durdurur ve sırayı temizler");