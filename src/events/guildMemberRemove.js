import db from "../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default client => {
    client.on('guildMemberRemove', async member => {
        try {
            const guildId = member.guild.id;
            const ayarlar = db.get(`bb_sistemi_${guildId}`);
            if (!ayarlar?.kanalId) return;

            const kanal = member.guild.channels.cache.get(ayarlar.kanalId);
            if (!kanal?.isTextBased()) return;

            const sonMesaj = ayarlar.mesaj
                .replace(/{user}/g, `**${member.user.tag}**`)
                .replace(/{sunucu}/g, member.guild.name)
                .replace(/{sayı}/g, member.guild.memberCount);

            let embed;
            if (client.embed) {
                embed = client.embed(sonMesaj, "kirmizi")
                    .setAuthor({ name: `Bir Üye Ayrıldı!`, iconURL: member.guild.iconURL() })
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTimestamp()
                    .setFooter({ text: `${member.user.tag} ayrıldı`, iconURL: member.user.displayAvatarURL() });
            } else {
                embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(sonMesaj)
                    .setAuthor({ name: `Bir Üye Ayrıldı!`, iconURL: member.guild.iconURL() })
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTimestamp()
                    .setFooter({ text: `${member.user.tag} ayrıldı`, iconURL: member.user.displayAvatarURL() });
            }

            await kanal.send({ content: `Görüşürüz **${member.user.username}**...`, embeds: [embed] });
        } catch (error) {
            console.error("❌ Görüşürüz mesajı hatası:", error);
        }
    });
};