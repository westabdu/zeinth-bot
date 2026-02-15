import { EmbedBuilder } from "discord.js";
import db from "../utils/database.js";

export default client => {
    client.on('interactionCreate', async interaction => {
        try {
            if (!interaction.isButton()) return;
            
            // Buton ID kontrolü (Artık herkes için aynı ID)
            if (interaction.customId !== 'kayit_ol_buton') return;

            // ⏳ Bekletiyoruz (Timeout yememek için)
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const member = interaction.member;

            // 1. Panel verisini çek (AWAIT EKLENDİ!)
            // Key formatı: kayit_panel_MESAJID_GUILDID
            const panelKey = `kayit_panel_${interaction.message.id}_${guild.id}`;
            const panel = await db.get(panelKey);

            if (!panel) {
                return interaction.editReply({ content: "❌ Bu kayıt paneli veritabanında bulunamadı!" });
            }

            // 2. Kullanıcı daha önce kayıt olmuş mu? (AWAIT EKLENDİ!)
            let kayitliKullanicilar = await db.get(`kayitli_kullanicilar_${guild.id}`) || [];
            
            if (kayitliKullanicilar.includes(member.id)) {
                return interaction.editReply({ content: "❌ Zaten kayıtlısın!" });
            }

            // 3. Rolleri ver/al
            const kayitsizRol = guild.roles.cache.get(panel.kayitsizRolId);
            const kayitliRol = guild.roles.cache.get(panel.kayitliRolId);

            if (kayitsizRol) await member.roles.remove(kayitsizRol).catch(() => {});
            if (kayitliRol) await member.roles.add(kayitliRol).catch(() => {});

            // 4. Kullanıcıyı kaydet (AWAIT EKLENDİ!)
            kayitliKullanicilar.push(member.id);
            await db.set(`kayitli_kullanicilar_${guild.id}`, kayitliKullanicilar);

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`✅ Aramıza hoş geldin **${member.user.username}**!`);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Kayıt Hatası:", error);
            await interaction.editReply({ content: "❌ Bir hata oluştu." }).catch(() => {});
        }
    });
};