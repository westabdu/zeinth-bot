// events/kayitHandler.js
import { EmbedBuilder } from "discord.js";
import db from "../utils/database.js";

export default client => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('kayit_ol_')) return;

        try {
            // Etkileşimi hemen defer et (süreyi uzat)
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const member = interaction.member;
            const userId = interaction.user.id;

            // Panel bilgilerini al
            const panelKey = `kayit_panel_${guild.id}_${interaction.message.id}`;
            const panel = await db.get(panelKey);

            if (!panel) {
                return interaction.editReply({ 
                    content: "❌ Bu kayıt paneli bulunamadı veya süresi dolmuş! Lütfen yetkililere bildir." 
                });
            }

            const kayitsizRol = guild.roles.cache.get(panel.kayitsizRolId);
            const kayitliRol = guild.roles.cache.get(panel.kayitliRolId);

            if (!kayitsizRol || !kayitliRol) {
                return interaction.editReply({ 
                    content: "❌ Kayıt rolleri sunucuda bulunamadı! Lütfen yetkililere bildir." 
                });
            }

            // Kullanıcı daha önce kayıt olmuş mu?
            const kayitliKullanicilar = await db.get(`kayitli_kullanicilar_${guild.id}`) || [];
            
            if (kayitliKullanicilar.includes(userId)) {
                return interaction.editReply({ 
                    content: "❌ Zaten daha önce kayıt olmuşsun! Bir kullanıcı sadece **1 kere** kayıt olabilir." 
                });
            }

            // Rol işlemleri
            if (member.roles.cache.has(kayitsizRol.id)) {
                await member.roles.remove(kayitsizRol.id);
            }

            if (!member.roles.cache.has(kayitliRol.id)) {
                await member.roles.add(kayitliRol.id);
            }

            // Listeye ekle
            kayitliKullanicilar.push(userId);
            await db.set(`kayitli_kullanicilar_${guild.id}`, kayitliKullanicilar);

            // Başarı mesajı
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Başarıyla Kayıt Oldun!")
                .setDescription(`Hoş geldin **${interaction.user.username}**!`)
                .addFields(
                    { name: "❌ Silinen Rol", value: kayitsizRol.name, inline: true },
                    { name: "✅ Eklenen Rol", value: kayitliRol.name, inline: true }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log
            const logKanalId = await db.get(`rollog_${guild.id}`);
            if (logKanalId) {
                const logKanal = guild.channels.cache.get(logKanalId);
                if (logKanal?.isTextBased()) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle("📝 Yeni Kayıt")
                        .setDescription(`${interaction.user} kayıt oldu!`)
                        .addFields(
                            { name: "👤 Kullanıcı", value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
                            { name: "❌ Silinen Rol", value: kayitsizRol.name, inline: true },
                            { name: "✅ Eklenen Rol", value: kayitliRol.name, inline: true }
                        )
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setTimestamp();
                    
                    await logKanal.send({ embeds: [logEmbed] }).catch(() => {});
                }
            }

        } catch (error) {
            console.error("❌ Kayıt buton hatası:", error);
            if (interaction.deferred) {
                await interaction.editReply({ 
                    content: "❌ Kayıt olurken bir hata oluştu! Lütfen daha sonra tekrar dene." 
                }).catch(() => {});
            } else {
                await interaction.reply({ 
                    content: "❌ Kayıt olurken bir hata oluştu!", 
                    ephemeral: true 
                }).catch(() => {});
            }
        }
    });

    console.log("✅ Kayıt Handler YÜKLENDİ!");
};