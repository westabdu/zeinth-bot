// events/kayitHandler.js
import { EmbedBuilder } from "discord.js";
import db from "../utils/database.js";

export default client => {
    client.on('interactionCreate', async interaction => {
        // Sadece butonları ve kayıt butonlarını işle
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('kayit_ol_')) return;

        try {
            // Önce deferReply yaparak etkileşimin süresini uzat (Koyeb gecikmeleri için kritik)
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const member = interaction.member;
            const userId = interaction.user.id;

            // Panel bilgilerini veritabanından al (await ile)
            const panelKey = `kayit_panel_${guild.id}_${interaction.message.id}`;
            const panel = await db.get(panelKey);

            if (!panel) {
                return interaction.editReply({ 
                    content: "❌ Bu kayıt paneli bulunamadı veya süresi dolmuş! Lütfen yetkililere bildir." 
                });
            }

            // Rolleri al
            const kayitsizRol = guild.roles.cache.get(panel.kayitsizRolId);
            const kayitliRol = guild.roles.cache.get(panel.kayitliRolId);

            if (!kayitsizRol || !kayitliRol) {
                return interaction.editReply({ 
                    content: "❌ Kayıt rolleri sunucuda bulunamadı! Lütfen yetkililere bildir." 
                });
            }

            // Kullanıcı daha önce kayıt olmuş mu? (await ile)
            const kayitliKullanicilar = await db.get(`kayitli_kullanicilar_${guild.id}`) || [];
            
            if (kayitliKullanicilar.includes(userId)) {
                return interaction.editReply({ 
                    content: "❌ Zaten daha önce kayıt olmuşsun! Bir kullanıcı sadece **1 kere** kayıt olabilir." 
                });
            }

            // Kayıtsız rolünü sil (varsa)
            if (member.roles.cache.has(kayitsizRol.id)) {
                await member.roles.remove(kayitsizRol.id);
            }

            // Kayıtlı rolünü ekle (yoksa)
            if (!member.roles.cache.has(kayitliRol.id)) {
                await member.roles.add(kayitliRol.id);
            }

            // Kullanıcıyı kayıtlılar listesine ekle (await ile)
            kayitliKullanicilar.push(userId);
            await db.set(`kayitli_kullanicilar_${guild.id}`, kayitliKullanicilar);

            // Başarılı mesajı (embed veya düz metin)
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Başarıyla Kayıt Oldun!")
                .setDescription(`Hoş geldin **${interaction.user.username}**!`)
                .addFields(
                    { name: "❌ Silinen Rol", value: `${kayitsizRol.name}`, inline: true },
                    { name: "✅ Eklenen Rol", value: `${kayitliRol.name}`, inline: true }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log kanalına mesaj at (opsiyonel)
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
            // Hata durumunda etkileşimi cevapla (eğer daha önce cevaplanmamışsa)
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: "❌ Kayıt olurken bir hata oluştu! Lütfen daha sonra tekrar dene.", 
                    ephemeral: true 
                }).catch(() => {});
            } else if (interaction.deferred) {
                await interaction.editReply({ 
                    content: "❌ Kayıt olurken bir hata oluştu! Lütfen daha sonra tekrar dene." 
                }).catch(() => {});
            }
        }
    });

    console.log("✅ Kayıt Handler YÜKLENDİ!");
};