import { EmbedBuilder } from "discord.js";
import db from "../utils/database.js";

export default client => {
    client.on('interactionCreate', async interaction => {
        try {
            if (!interaction.isButton()) return;
            
            // Sadece kayıt butonlarını işle
            if (interaction.customId !== 'kayit_ol_buton') return;

            // Butona tıklayanın bot olmadığından emin ol
            if (interaction.user.bot) return;

            // DeferReply ile yanıtı geciktir (3 saniyeden uzun sürecek işlemler için)
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const member = interaction.member;

            // Üyenin hala sunucuda olduğunu kontrol et
            if (!member) {
                return interaction.editReply({ content: "❌ Üye bilgisi bulunamadı!" });
            }

            // Panel verisini çek
            const panelKey = `kayit_panel_${interaction.message.id}_${guild.id}`;
            const panel = await db.get(panelKey);

            if (!panel) {
                return interaction.editReply({ 
                    content: "❌ Bu kayıt paneli veritabanında bulunamadı! Lütfen yetkililere bildir." 
                });
            }

            // Kullanıcı daha önce kayıt olmuş mu?
            let kayitliKullanicilar = await db.get(`kayitli_kullanicilar_${guild.id}`) || [];
            
            if (kayitliKullanicilar.includes(member.id)) {
                return interaction.editReply({ 
                    content: "❌ Zaten kayıtlısın! Eğer bir sorun yaşıyorsan yetkililere başvur." 
                });
            }

            // Rolleri al
            const kayitsizRol = guild.roles.cache.get(panel.kayitsizRolId);
            const kayitliRol = guild.roles.cache.get(panel.kayitliRolId);

            // Rollerin varlığını kontrol et
            if (!kayitsizRol && !kayitliRol) {
                return interaction.editReply({ 
                    content: "❌ Kayıt rolleri bulunamadı! Lütfen yetkililere bildir." 
                });
            }

            // Rol verme/alma işlemleri
            let islemYapildi = false;

            if (kayitsizRol && member.roles.cache.has(kayitsizRol.id)) {
                await member.roles.remove(kayitsizRol).catch(err => {
                    console.error("❌ Kayıtsız rol alınamadı:", err);
                });
                islemYapildi = true;
            }

            if (kayitliRol && !member.roles.cache.has(kayitliRol.id)) {
                await member.roles.add(kayitliRol).catch(err => {
                    console.error("❌ Kayıtlı rol verilemedi:", err);
                });
                islemYapildi = true;
            }

            if (!islemYapildi) {
                return interaction.editReply({ 
                    content: "❌ Rol işlemleri yapılamadı! Lütfen yetkililere bildir." 
                });
            }

            // Kullanıcıyı kaydet
            kayitliKullanicilar.push(member.id);
            await db.set(`kayitli_kullanicilar_${guild.id}`, kayitliKullanicilar);

            // Başarı mesajı
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Kayıt Başarılı!")
                .setDescription(`Aramıza hoş geldin **${member.user.username}**!`)
                .addFields(
                    { name: "📌 Verilen Rol", value: kayitliRol ? `${kayitliRol}` : "Rol bulunamadı", inline: true },
                    { name: "📌 Alınan Rol", value: kayitsizRol ? `${kayitsizRol}` : "Rol bulunamadı", inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log kanalına bildirim gönder (opsiyonel)
            const logChannel = await db.get(`logChannel_${guild.id}`);
            if (logChannel) {
                const kanal = guild.channels.cache.get(logChannel);
                if (kanal) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setTitle("📝 Yeni Kayıt")
                        .setDescription(`${member.user} (\`${member.user.id}\`) kayıt oldu.`)
                        .setThumbnail(member.user.displayAvatarURL())
                        .setTimestamp();
                    
                    await kanal.send({ embeds: [logEmbed] }).catch(() => {});
                }
            }

        } catch (error) {
            console.error("❌ Kayıt Hatası:", error);
            
            // Hatayı kullanıcıya bildir
            try {
                if (interaction.deferred) {
                    await interaction.editReply({ 
                        content: "❌ Bir hata oluştu! Lütfen daha sonra tekrar dene veya yetkililere bildir." 
                    });
                } else {
                    await interaction.reply({ 
                        content: "❌ Bir hata oluştu!", 
                        ephemeral: true 
                    });
                }
            } catch (e) {
                console.error("❌ Hata mesajı gönderilemedi:", e);
            }
        }
    });
};