import { EmbedBuilder } from "discord.js";
import db from "../utils/database.js";

export default client => {
    client.on('interactionCreate', async interaction => {
        try {
            if (!interaction.isButton()) return;
            if (!interaction.customId.startsWith('kayit_ol_')) return;

            // 1. Hemen "Bekle geliyorum" diyoruz (Koyeb lagı için şart!)
            await interaction.deferReply({ ephemeral: true });

            const guild = interaction.guild;
            const member = interaction.member;

            // 2. Verileri çek (AWAIT'ler eklendi)
            const panelKey = `kayit_panel_${guild.id}_${interaction.message.id}`;
            const panel = await db.get(panelKey);

            if (!panel) return interaction.editReply({ content: "❌ Kayıt paneli veritabanında bulunamadı!" });

            const kayitsizRol = guild.roles.cache.get(panel.kayitsizRolId);
            const kayitliRol = guild.roles.cache.get(panel.kayitliRolId);

            if (!kayitliRol) return interaction.editReply({ content: "❌ Verilecek rol sunucuda bulunamadı!" });

            // 3. Rol verme işlemi
            await member.roles.add(kayitliRol);
            if (kayitsizRol && member.roles.cache.has(kayitsizRol.id)) {
                await member.roles.remove(kayitsizRol);
            }

            // 4. Başarı mesajı
            return interaction.editReply({ content: `✅ Başarıyla kayıt oldun! **${kayitliRol.name}** rolü verildi.` });

        } catch (error) {
            console.error("❌ Kayıt Hatası:", error);
            if (interaction.deferred) {
                await interaction.editReply({ content: "❌ Kayıt sırasında teknik bir hata oluştu!" });
            }
        }
    });
};