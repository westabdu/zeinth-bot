import { EmbedBuilder } from "discord.js";
import db from "../utils/database.js";

export default client => {
    client.on('interactionCreate', async interaction => {
        try {
            // Sadece butonları yakala
            if (!interaction.isButton()) return;
            
            // Sadece kayıt butonlarını yakala
            if (!interaction.customId.startsWith('kayit_ol_')) return;

            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const member = interaction.member;
            const userId = interaction.user.id;

            // Panel bilgilerini al
            const panelKey = `kayit_panel_${guild.id}_${interaction.message.id}`;
            const panel = db.get(panelKey);

            if (!panel) {
                return interaction.editReply({ 
                    content: "❌ Bu kayıt paneli bulunamadı veya süresi dolmuş!" 
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

            // Kullanıcı daha önce kayıt olmuş mu?
            const kayitliKullanicilar = db.get(`kayitli_kullanicilar_${guild.id}`) || [];
            
            if (kayitliKullanicilar.includes(userId)) {
                return interaction.editReply({ 
                    content: "❌ Zaten daha önce kayıt olmuşsun! Bir kullanıcı sadece **1 kere** kayıt olabilir." 
                });
            }

            // 🔥 ASIL İŞLEM: ROLLERİ DÜZENLE
            
            // 1. Kayıtsız rolünü sil (varsa)
            if (member.roles.cache.has(kayitsizRol.id)) {
                await member.roles.remove(kayitsizRol.id);
            }

            // 2. Kayıtlı rolünü ekle (yoksa)
            if (!member.roles.cache.has(kayitliRol.id)) {
                await member.roles.add(kayitliRol.id);
            }

            // 3. Kullanıcıyı kayıtlılar listesine ekle
            kayitliKullanicilar.push(userId);
            db.set(`kayitli_kullanicilar_${guild.id}`, kayitliKullanicilar);

            // Başarılı mesajı
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

            // 📝 Log kanalına mesaj at (opsiyonel)
            const logKanalId = db.get(`rollog_${guild.id}`);
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
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: "❌ Kayıt olurken bir hata oluştu! Lütfen daha sonra tekrar dene.", 
                    ephemeral: true 
                }).catch(() => {});
            }
        }
    });

    console.log("✅ Kayıt Handler YÜKLENDİ!");
};