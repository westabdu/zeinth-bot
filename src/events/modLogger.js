// events/modLogger.js - Gelişmiş Log Sistemi
import db from "../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default client => {
    // -------------------- MESAJ LOGLARI --------------------
    client.on('messageDelete', async message => {
        try {
            if (!message || message.author?.bot || !message.guild) return;
            const logChannelId = await db.get(`logChannel_${message.guild.id}`);
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
            const logChannelId = await db.get(`logChannel_${newMessage.guild.id}`);
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

    // -------------------- ÜYE LOGLARI --------------------
    client.on('guildMemberAdd', async member => {
        try {
            const logChannelId = await db.get(`logChannel_${member.guild.id}`);
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
            const logChannelId = await db.get(`logChannel_${member.guild.id}`);
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

    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        try {
            const logChannelId = await db.get(`logChannel_${newMember.guild.id}`);
            if (!logChannelId) return;
            const channel = newMember.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            // Kullanıcı adı değişikliği
            if (oldMember.displayName !== newMember.displayName) {
                const embed = new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("📝 Kullanıcı Adı Değişti")
                    .setDescription(`${newMember.user}`)
                    .addFields(
                        { name: "Eski Ad", value: oldMember.displayName, inline: true },
                        { name: "Yeni Ad", value: newMember.displayName, inline: true }
                    )
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }

            // Rol ekleme/çıkarma
            const eklenenRoller = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id)).map(role => role.name);
            const cikartilanRoller = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id)).map(role => role.name);

            if (eklenenRoller.length > 0) {
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Rol Eklendi")
                    .setDescription(`${newMember.user}`)
                    .addFields({ name: "Eklenen Roller", value: eklenenRoller.join(', ') })
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }

            if (cikartilanRoller.length > 0) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Rol Çıkarıldı")
                    .setDescription(`${newMember.user}`)
                    .addFields({ name: "Çıkarılan Roller", value: cikartilanRoller.join(', ') })
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Üye güncelleme log hatası:", error);
        }
    });

    // -------------------- BAN LOGLARI --------------------
    client.on('guildBanAdd', async (guild, user) => {
        try {
            const logChannelId = await db.get(`logChannel_${guild.id}`);
            if (!logChannelId) return;
            const channel = guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🔨 Kullanıcı Banlandı")
                .setDescription(`${user.tag} (${user.id})`)
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Ban log hatası:", error);
        }
    });

    client.on('guildBanRemove', async (guild, user) => {
        try {
            const logChannelId = await db.get(`logChannel_${guild.id}`);
            if (!logChannelId) return;
            const channel = guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("🔓 Kullanıcının Banı Kaldırıldı")
                .setDescription(`${user.tag} (${user.id})`)
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Ban kaldırma log hatası:", error);
        }
    });

    // -------------------- ROL LOGLARI --------------------
    client.on('roleCreate', async role => {
        try {
            const logChannelId = await db.get(`logChannel_${role.guild.id}`);
            if (!logChannelId) return;
            const channel = role.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("➕ Rol Oluşturuldu")
                .addFields(
                    { name: "Rol", value: `${role.name} (${role.id})`, inline: true },
                    { name: "Renk", value: role.hexColor, inline: true },
                    { name: "Konum", value: `${role.position}`, inline: true }
                )
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Rol oluşturma log hatası:", error);
        }
    });

    client.on('roleDelete', async role => {
        try {
            const logChannelId = await db.get(`logChannel_${role.guild.id}`);
            if (!logChannelId) return;
            const channel = role.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("➖ Rol Silindi")
                .addFields(
                    { name: "Rol Adı", value: role.name, inline: true },
                    { name: "Rol ID", value: role.id, inline: true }
                )
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Rol silme log hatası:", error);
        }
    });

    client.on('roleUpdate', async (oldRole, newRole) => {
        try {
            const logChannelId = await db.get(`logChannel_${newRole.guild.id}`);
            if (!logChannelId) return;
            const channel = newRole.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            // Değişiklikleri karşılaştır
            if (oldRole.name !== newRole.name) {
                const embed = new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("✏️ Rol Adı Değişti")
                    .addFields(
                        { name: "Rol", value: `<@&${newRole.id}>`, inline: true },
                        { name: "Eski Ad", value: oldRole.name, inline: true },
                        { name: "Yeni Ad", value: newRole.name, inline: true }
                    )
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }

            if (oldRole.color !== newRole.color) {
                const embed = new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("🎨 Rol Rengi Değişti")
                    .addFields(
                        { name: "Rol", value: `<@&${newRole.id}>`, inline: true },
                        { name: "Eski Renk", value: oldRole.hexColor, inline: true },
                        { name: "Yeni Renk", value: newRole.hexColor, inline: true }
                    )
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }

            // Diğer özellikler (izinler, ayrı gösterim vb.) istenirse eklenebilir
        } catch (error) {
            console.error("❌ Rol güncelleme log hatası:", error);
        }
    });

    // -------------------- KANAL LOGLARI --------------------
    client.on('channelCreate', async channel => {
        if (channel.type === 4) return; // kategori kanallarını loglama (isteğe bağlı)
        try {
            const logChannelId = await db.get(`logChannel_${channel.guild.id}`);
            if (!logChannelId) return;
            const logChannel = channel.guild.channels.cache.get(logChannelId);
            if (!logChannel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("📢 Kanal Oluşturuldu")
                .addFields(
                    { name: "Kanal", value: `${channel.name} (${channel.id})`, inline: true },
                    { name: "Tür", value: channel.type === 0 ? "📝 Metin" : "🔊 Ses", inline: true },
                    { name: "Kategori", value: channel.parent ? channel.parent.name : "Yok", inline: true }
                )
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Kanal oluşturma log hatası:", error);
        }
    });

    client.on('channelDelete', async channel => {
        if (channel.type === 4) return;
        try {
            const logChannelId = await db.get(`logChannel_${channel.guild.id}`);
            if (!logChannelId) return;
            const logChannel = channel.guild.channels.cache.get(logChannelId);
            if (!logChannel?.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🗑️ Kanal Silindi")
                .addFields(
                    { name: "Kanal Adı", value: channel.name, inline: true },
                    { name: "Tür", value: channel.type === 0 ? "📝 Metin" : "🔊 Ses", inline: true },
                    { name: "Kategori", value: channel.parent ? channel.parent.name : "Yok", inline: true }
                )
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Kanal silme log hatası:", error);
        }
    });

    client.on('channelUpdate', async (oldChannel, newChannel) => {
        if (oldChannel.type === 4 || newChannel.type === 4) return;
        try {
            const logChannelId = await db.get(`logChannel_${newChannel.guild.id}`);
            if (!logChannelId) return;
            const logChannel = newChannel.guild.channels.cache.get(logChannelId);
            if (!logChannel?.isTextBased()) return;

            const embeds = [];

            if (oldChannel.name !== newChannel.name) {
                embeds.push(
                    new EmbedBuilder()
                        .setColor("Yellow")
                        .setTitle("✏️ Kanal Adı Değişti")
                        .addFields(
                            { name: "Kanal", value: `<#${newChannel.id}>`, inline: true },
                            { name: "Eski Ad", value: oldChannel.name, inline: true },
                            { name: "Yeni Ad", value: newChannel.name, inline: true }
                        )
                        .setTimestamp()
                );
            }

            if (oldChannel.parentId !== newChannel.parentId) {
                embeds.push(
                    new EmbedBuilder()
                        .setColor("Yellow")
                        .setTitle("📂 Kanal Kategorisi Değişti")
                        .addFields(
                            { name: "Kanal", value: `<#${newChannel.id}>`, inline: true },
                            { name: "Eski Kategori", value: oldChannel.parent ? oldChannel.parent.name : "Yok", inline: true },
                            { name: "Yeni Kategori", value: newChannel.parent ? newChannel.parent.name : "Yok", inline: true }
                        )
                        .setTimestamp()
                );
            }

            for (const embed of embeds) {
                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Kanal güncelleme log hatası:", error);
        }
    });

    // -------------------- SES LOGLARI (opsiyonel) --------------------
    client.on('voiceStateUpdate', async (oldState, newState) => {
        try {
            const logChannelId = await db.get(`logChannel_${newState.guild.id}`);
            if (!logChannelId) return;
            const channel = newState.guild.channels.cache.get(logChannelId);
            if (!channel?.isTextBased()) return;

            const member = newState.member;
            if (!member) return;

            // Ses kanalına giriş
            if (!oldState.channelId && newState.channelId) {
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🔊 Ses Kanalına Katıldı")
                    .setDescription(`${member.user}`)
                    .addFields(
                        { name: "Kanal", value: `${newState.channel.name}`, inline: true }
                    )
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }
            // Ses kanalından çıkış
            else if (oldState.channelId && !newState.channelId) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🔇 Ses Kanalından Ayrıldı")
                    .setDescription(`${member.user}`)
                    .addFields(
                        { name: "Kanal", value: `${oldState.channel.name}`, inline: true }
                    )
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }
            // Kanal değiştirme
            else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                const embed = new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("🔄 Ses Kanalı Değiştirdi")
                    .setDescription(`${member.user}`)
                    .addFields(
                        { name: "Eski Kanal", value: `${oldState.channel.name}`, inline: true },
                        { name: "Yeni Kanal", value: `${newState.channel.name}`, inline: true }
                    )
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Ses log hatası:", error);
        }
    });

    client.once('ready', () => console.log('✅ Gelişmiş log sistemi aktif!'));
};