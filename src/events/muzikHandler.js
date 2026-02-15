import { EmbedBuilder } from "discord.js";

export default client => {
    // Şarkı başladığında
    client.distube.on("playSong", (queue, song) => {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle("🎵 Şimdi Çalıyor")
            .setDescription(`[${song.name}](${song.url})`)
            .addFields(
                { name: "⏱️ Süre", value: song.formattedDuration, inline: true },
                { name: "👤 İsteyen", value: song.user.tag, inline: true }
            )
            .setThumbnail(song.thumbnail)
            .setTimestamp();
        
        queue.textChannel?.send({ embeds: [embed] });
    });
    
    // Şarkı eklendiğinde
    client.distube.on("addSong", (queue, song) => {
        queue.textChannel?.send({ 
            content: `✅ **${song.name}** sıraya eklendi! (${song.formattedDuration})` 
        });
    });
    
    // Sıra bittiğinde
    client.distube.on("finish", queue => {
        queue.textChannel?.send("✅ Sıra bitti! Odadan çıkıyorum...");
    });
    
    // Hata durumunda
    client.distube.on("error", (channel, error) => {
        console.error("❌ Müzik hatası:", error);
        channel?.send("❌ Bir hata oluştu: " + error.message.slice(0, 100));
    });
};