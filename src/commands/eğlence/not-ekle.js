// commands/genel/not.js
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "not",
    description: "📝 Kendine not ekle, listele veya sil",
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const notlarKey = `notlar_${userId}`;
        
        let notlar = await db.get(notlarKey) || [];
        
        if (sub === "ekle") {
            const baslik = interaction.options.getString("baslik");
            const icerik = interaction.options.getString("icerik");
            
            const yeniNot = {
                id: Date.now(),
                baslik,
                icerik,
                tarih: new Date().toLocaleDateString('tr-TR')
            };
            
            notlar.push(yeniNot);
            await db.set(notlarKey, notlar);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Not Eklendi")
                .addFields(
                    { name: "📌 Başlık", value: baslik, inline: true },
                    { name: "📝 İçerik", value: icerik.substring(0, 100), inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        }
        
        else if (sub === "listele") {
            if (notlar.length === 0) {
                return interaction.reply({ content: "📭 Henüz hiç not eklememişsin!", ephemeral: true });
            }
            
            let notListesi = "";
            notlar.slice(0, 10).forEach((not, index) => {
                notListesi += `**${index+1}. ${not.baslik}** (${not.tarih})\n└ ${not.icerik.substring(0, 50)}${not.icerik.length > 50 ? '...' : ''}\n`;
            });
            
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`📋 ${interaction.user.username}'ın Notları`)
                .setDescription(notListesi || "Listelenecek not yok")
                .setFooter({ text: `Toplam ${notlar.length} not` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        }
        
        else if (sub === "sil") {
            const id = interaction.options.getInteger("id");
            const silinecekNot = notlar.find(n => n.id === id);
            
            if (!silinecekNot) {
                return interaction.reply({ content: "❌ Bu ID'ye ait not bulunamadı!", ephemeral: true });
            }
            
            notlar = notlar.filter(n => n.id !== id);
            await db.set(notlarKey, notlar);
            
            await interaction.reply({ content: `✅ **${silinecekNot.baslik}** başlıklı not silindi.`, ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("not")
    .setDescription("📝 Kendine not ekle, listele veya sil")
    .addSubcommand(sub => 
        sub.setName("ekle")
            .setDescription("Yeni not ekle")
            .addStringOption(opt => opt.setName("baslik").setDescription("Not başlığı").setRequired(true))
            .addStringOption(opt => opt.setName("icerik").setDescription("Not içeriği").setRequired(true)))
    .addSubcommand(sub => 
        sub.setName("listele")
            .setDescription("Notlarını listele"))
    .addSubcommand(sub => 
        sub.setName("sil")
            .setDescription("Not sil")
            .addIntegerOption(opt => opt.setName("id").setDescription("Silinecek not ID'si").setRequired(true)));