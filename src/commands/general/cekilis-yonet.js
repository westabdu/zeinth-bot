import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import cekilisDB from "../../utils/cekilisDB.js";
import { sonuclandirCekilis } from "../../events/cekilisHandler.js"; // ✅ DOĞRU IMPORT

export const data = {
    name: "çekiliş-yönet",
    description: "Çekilişleri yönet",
    permission: "ManageMessages",
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === "listele") {
            const all = cekilisDB.all();
            const aktifCekilisler = all.filter(item => 
                item.id.startsWith('cekilis_') && 
                !item.data.sonuclandi && 
                Date.now() < item.data.bitisZamani
            );
            
            if (aktifCekilisler.length === 0) {
                return interaction.reply({ content: "✅ Aktif çekiliş bulunmuyor.", ephemeral: true });
            }
            
            const embed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle("📋 Aktif Çekilişler")
                .setDescription(`**Toplam:** ${aktifCekilisler.length} aktif çekiliş`);
            
            aktifCekilisler.slice(0, 5).forEach((cekilis, index) => { // max 5 göster
                const data = cekilis.data;
                embed.addFields({
                    name: `${index + 1}. ${data.odul.substring(0, 50)}${data.odul.length > 50 ? '...' : ''}`,
                    value: `ID: \`${cekilis.id}\`\nKatılımcı: ${data.katilimcilar?.length || 0}\nBitiş: <t:${Math.floor(data.bitisZamani / 1000)}:R>`,
                    inline: true
                });
            });
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        if (subcommand === "bitir") {
            const cekilisId = interaction.options.getString("id");
            const cekilis = cekilisDB.get(cekilisId);
            
            if (!cekilis) {
                return interaction.reply({ content: "❌ Çekiliş bulunamadı!", ephemeral: true });
            }
            
            if (cekilis.sonuclandi) {
                return interaction.reply({ content: "❌ Bu çekiliş zaten sonuçlandırılmış!", ephemeral: true });
            }
            
            try {
                const channel = await interaction.client.channels.fetch(cekilis.kanalId);
                const message = await channel.messages.fetch(cekilis.mesajId);
                
                // Çekilişi erken bitir
                cekilis.bitisZamani = Date.now();
                cekilisDB.set(cekilisId, cekilis);
                
                await sonuclandirCekilis(cekilisId, message);
                await interaction.reply({ content: "✅ Çekiliş erken sonlandırıldı!", ephemeral: true });
            } catch (error) {
                console.error("❌ Çekiliş bitirme hatası:", error);
                await interaction.reply({ content: "❌ Çekiliş sonlandırılamadı! Mesaj silinmiş olabilir.", ephemeral: true });
            }
        }
        
        if (subcommand === "yeniden-çek") {
            const cekilisId = interaction.options.getString("id");
            const cekilis = cekilisDB.get(cekilisId);
            
            if (!cekilis) {
                return interaction.reply({ content: "❌ Çekiliş bulunamadı!", ephemeral: true });
            }
            
            if (!cekilis.sonuclandi) {
                return interaction.reply({ content: "❌ Bu çekiliş henüz sonuçlanmamış! Önce bitir veya bekle.", ephemeral: true });
            }
            
            try {
                const channel = await interaction.client.channels.fetch(cekilis.kanalId);
                const message = await channel.messages.fetch(cekilis.mesajId);
                
                // Sonuçlandı bayrağını kaldır ve yeniden çek
                cekilis.sonuclandi = false;
                cekilisDB.set(cekilisId, cekilis);
                
                await sonuclandirCekilis(cekilisId, message);
                await interaction.reply({ content: "✅ Kazananlar yeniden çekildi!", ephemeral: true });
            } catch (error) {
                console.error("❌ Yeniden çekme hatası:", error);
                await interaction.reply({ content: "❌ Yeniden çekme başarısız!", ephemeral: true });
            }
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("çekiliş-yönet")
    .setDescription("Çekiliş yönetim komutları")
    .addSubcommand(sub =>
        sub.setName("listele").setDescription("Aktif çekilişleri listele"))
    .addSubcommand(sub =>
        sub.setName("bitir")
            .setDescription("Çekilişi erken bitir")
            .addStringOption(opt => opt.setName("id").setDescription("Çekiliş mesaj ID'si").setRequired(true)))
    .addSubcommand(sub =>
        sub.setName("yeniden-çek")
            .setDescription("Kazananları yeniden çek")
            .addStringOption(opt => opt.setName("id").setDescription("Çekiliş mesaj ID'si").setRequired(true)));