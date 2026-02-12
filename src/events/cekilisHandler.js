import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import cekilisDB from "../utils/cekilisDB.js"; // ✅ TEK INSTANCE

// 🎲 Rastgele kazanan seç
function rastgeleKazananSec(katilimcilar, kazananSayisi) {
    if (!katilimcilar || katilimcilar.length === 0) return [];
    if (katilimcilar.length <= kazananSayisi) return [...katilimcilar];
    
    // Fisher–Yates shuffle
    const shuffled = [...katilimcilar];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, kazananSayisi);
}

// 🏆 Çekiliş sonuçlandır - DIŞARIYA EXPORT EDİYORUZ!
export async function sonuclandirCekilis(cekilisId, message) {
    try {
        const cekilis = cekilisDB.get(cekilisId);
        if (!cekilis || cekilis.sonuclandi) return;
        
        cekilis.sonuclandi = true;
        cekilisDB.set(cekilisId, cekilis);
        
        const katilimcilar = cekilis.katilimcilar || [];
        const kazananlar = rastgeleKazananSec(katilimcilar, cekilis.kazananSayisi);
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle("🎉 ÇEKİLİŞ SONUÇLANDI!")
            .setDescription(`**Ödül:** ${cekilis.odul}`)
            .addFields(
                { name: "👥 Toplam Katılımcı", value: katilimcilar.length.toString(), inline: true },
                { name: "🎯 Kazanan Sayısı", value: kazananlar.length.toString(), inline: true },
                { name: "🏆 Kazananlar", value: kazananlar.length > 0 ? kazananlar.map(id => `<@${id}>`).join(', ') : "Katılımcı yok!", inline: false }
            )
            .setFooter({ text: `Başlatan: ${cekilis.baslatanTag} | ID: ${cekilisId}` })
            .setTimestamp();
        
        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("cekilis_katil")
                .setLabel("🎫 Katıl!")
                .setStyle(ButtonStyle.Success)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId("cekilis_durum")
                .setLabel("📊 Durum")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
        
        await message.edit({ embeds: [embed], components: [disabledRow] });
        
        if (kazananlar.length > 0) {
            const kazananMention = kazananlar.map(id => `<@${id}>`).join(' ');
            await message.reply(`🎉 **TEBRİKLER!** ${kazananMention}\n**${cekilis.odul}** kazandınız!`);
        } else {
            await message.reply("😔 Hiç katılımcı olmadığı için çekiliş iptal edildi.");
        }
    } catch (error) {
        console.error("❌ Çekiliş sonuçlandırma hatası:", error);
    }
}

export default client => {
    client.on('interactionCreate', async interaction => {
        try {
            // Sadece butonları yakala
            if (!interaction.isButton()) return;
            
            const cekilisId = `cekilis_${interaction.message.id}`;
            const cekilis = cekilisDB.get(cekilisId);
            if (!cekilis) return;

            // ============ 1. KATILMA BUTONU ============
            if (interaction.customId === "cekilis_katil") {
                // Zaman kontrolü
                if (Date.now() > cekilis.bitisZamani) {
                    return interaction.reply({ 
                        content: "❌ Bu çekilişin süresi dolmuş!", 
                        ephemeral: true 
                    });
                }
                
                // Zaten katılmış mı?
                if (cekilis.katilimcilar.includes(interaction.user.id)) {
                    return interaction.reply({ 
                        content: "❌ Zaten bu çekilişe katıldın!", 
                        ephemeral: true 
                    });
                }
                
                // Katılımcı ekle
                cekilis.katilimcilar.push(interaction.user.id);
                cekilisDB.set(cekilisId, cekilis);
                
                // Embed'i güncelle (katılımcı sayısı)
                try {
                    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                    embed.data.fields[1].value = cekilis.katilimcilar.length.toString();
                    await interaction.message.edit({ embeds: [embed] });
                } catch (e) {
                    console.error("❌ Embed güncelleme hatası:", e);
                }
                
                await interaction.reply({ 
                    content: "✅ Çekilişe başarıyla katıldın! 🎉", 
                    ephemeral: true 
                });
            }
            
            // ============ 2. DURUM BUTONU ============
            if (interaction.customId === "cekilis_durum") {
                const embed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle("📊 Çekiliş Durumu")
                    .addFields(
                        { name: "🎁 Ödül", value: cekilis.odul, inline: true },
                        { name: "👥 Katılımcı", value: cekilis.katilimcilar.length.toString(), inline: true },
                        { name: "⏳ Kalan Süre", value: `<t:${Math.floor(cekilis.bitisZamani / 1000)}:R>`, inline: true },
                        { name: "🎯 Kazanan Sayısı", value: cekilis.kazananSayisi.toString(), inline: true },
                        { name: "🚀 Başlatan", value: `<@${cekilis.baslatan}>`, inline: true },
                        { name: "📅 Başlangıç", value: `<t:${Math.floor(cekilis.createdAt / 1000)}:R>`, inline: true }
                    )
                    .setFooter({ text: `Çekiliş ID: ${cekilisId}` });
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

        } catch (error) {
            console.error("❌ Çekiliş buton hatası:", error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: "❌ Bir hata oluştu! Lütfen daha sonra tekrar dene.", 
                    ephemeral: true 
                }).catch(() => {});
            }
        }
    });

    // 🔍 Otomatik tamamlama (autocomplete) - AYRI BİR INTERACTION
    client.on('interactionCreate', async interaction => {
        try {
            if (!interaction.isAutocomplete()) return;
            if (interaction.commandName !== "çekiliş") return;

            const focusedValue = interaction.options.getFocused();
            const choices = [
                { name: '⏱️ 30 dakika', value: '30m' },
                { name: '⏱️ 1 saat', value: '1h' },
                { name: '⏱️ 2 saat', value: '2h' },
                { name: '⏱️ 6 saat', value: '6h' },
                { name: '⏱️ 12 saat', value: '12h' },
                { name: '📅 1 gün', value: '1d' },
                { name: '📅 3 gün', value: '3d' },
                { name: '📅 1 hafta', value: '7d' }
            ];
            
            const filtered = choices.filter(choice => 
                choice.name.toLowerCase().includes(focusedValue.toLowerCase())
            );
            
            await interaction.respond(
                filtered.map(choice => ({ name: choice.name, value: choice.value }))
            );
        } catch (error) {
            console.error("❌ Çekiliş autocomplete hatası:", error);
        }
    });

    console.log("✅ ÇEKİLİŞ HANDLER YÜKLENDİ!");
};