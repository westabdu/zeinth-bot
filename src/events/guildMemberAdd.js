import db from "../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default client => {
    client.on('guildMemberAdd', async member => {
        try {
            const guildId = member.guild.id;
            const ayarlar = db.get(`hg_sistemi_${guildId}`);
            if (!ayarlar?.kanalId) return;

            const kanal = member.guild.channels.cache.get(ayarlar.kanalId);
            if (!kanal?.isTextBased()) return;

            // Mesaj değişkenlerini çevir
            const sonMesaj = ayarlar.mesaj
                .replace(/{user}/g, `<@${member.id}>`)
                .replace(/{sunucu}/g, member.guild.name)
                .replace(/{sayı}/g, member.guild.memberCount);

            // Otorol
            const otorolId = db.get(`otorol_${member.guild.id}`);
            if (otorolId) {
                const rol = member.guild.roles.cache.get(otorolId);
                if (rol && member.guild.members.me.roles.highest.comparePositionTo(rol) > 0) {
                    await member.roles.add(rol).catch(() => console.log("⚠️ Otorol verilemedi."));
                }
            }

            // Embed oluştur (client.embed yoksa fallback)
            let embed;
            if (client.embed) {
                embed = client.embed(sonMesaj, "ana")
                    .setAuthor({ name: `Aramıza Katıldı!`, iconURL: member.guild.iconURL() })
                    .setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTimestamp()
                    .setFooter({ text: `${member.user.tag} giriş yaptı`, iconURL: member.user.displayAvatarURL() });
            } else {
                embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setDescription(sonMesaj)
                    .setAuthor({ name: `Aramıza Katıldı!`, iconURL: member.guild.iconURL() })
                    .setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setTimestamp()
                    .setFooter({ text: `${member.user.tag} giriş yaptı`, iconURL: member.user.displayAvatarURL() });
            }

            await kanal.send({ content: `Hoş geldin ${member}!`, embeds: [embed] });
        } catch (error) {
            console.error("❌ Hoş geldin mesajı hatası:", error);
        }
    });
};