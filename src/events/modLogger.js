import db from "../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default client => {
    client.on('messageDelete', async message => {
        try {
            if (!message || message.author?.bot || !message.guild) return;
            const logChannelId = db.get(`logChannel_${message.guild.id}`);
            if (!logChannelId) return;
            const channel = message.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🗑️ Mesaj Silindi")
                .addFields(
                    { name: "Kullanıcı", value: message.author ? `${message.author}` : "Bilinmeyen", inline: true },
                    { name: "Kullanıcı ID", value: message.author?.id || "Bilinmiyor", inline: true },
                    { name: "Kanal", value: `${message.channel}`, inline: true },
                    { name: "İçerik", value: message.content ? 
                        (message.content.length > 1000 ? message.content.substring(0,1000)+"..." : message.content) 
                        : "*Görsel/Embed*" }
                )
                .setTimestamp()
                .setFooter({ text: `Mesaj ID: ${message.id}` });
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Mesaj silme log hatası:", error);
        }
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        try {
            if (!oldMessage || oldMessage.author?.bot || !oldMessage.guild) return;
            if (oldMessage.content === newMessage.content) return;
            const logChannelId = db.get(`logChannel_${newMessage.guild.id}`);
            if (!logChannelId) return;
            const channel = newMessage.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("✏️ Mesaj Düzenlendi")
                .addFields(
                    { name: "Kullanıcı", value: newMessage.author ? `${newMessage.author}` : "Bilinmeyen", inline: true },
                    { name: "Kullanıcı ID", value: newMessage.author?.id || "Bilinmiyor", inline: true },
                    { name: "Kanal", value: `${newMessage.channel}`, inline: true },
                    { name: "Eski Hali", value: oldMessage.content?.substring(0,500) + (oldMessage.content?.length > 500 ? "..." : "") || "*Yok*" },
                    { name: "Yeni Hali", value: newMessage.content?.substring(0,500) + (newMessage.content?.length > 500 ? "..." : "") || "*Yok*" }
                )
                .setTimestamp()
                .setFooter({ text: `Mesaj ID: ${newMessage.id}` });
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Mesaj düzenleme log hatası:", error);
        }
    });

    client.on('guildMemberAdd', async member => {
        try {
            const logChannelId = db.get(`logChannel_${member.guild.id}`);
            if (!logChannelId) return;
            const channel = member.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("👋 Üye Katıldı")
                .addFields(
                    { name: "Kullanıcı", value: `${member.user}`, inline: true },
                    { name: "Kullanıcı ID", value: member.user.id, inline: true },
                    { name: "Hesap Oluşturulma", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Üye katılma log hatası:", error);
        }
    });

    client.on('guildMemberRemove', async member => {
        try {
            const logChannelId = db.get(`logChannel_${member.guild.id}`);
            if (!logChannelId) return;
            const channel = member.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Orange")
                .setTitle("👋 Üye Ayrıldı")
                .addFields(
                    { name: "Kullanıcı", value: `${member.user}`, inline: true },
                    { name: "Kullanıcı ID", value: member.user.id, inline: true },
                    { name: "Sunucudaki Rol Sayısı", value: `${member.roles.cache.size - 1}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Üye ayrılma log hatası:", error);
        }
    });

    client.once('ready', () => console.log('✅ Mod logger aktif!'));
};