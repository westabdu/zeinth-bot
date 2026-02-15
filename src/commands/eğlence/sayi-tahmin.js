// commands/oyun/sayi-tahmin.js
import { SlashCommandBuilder } from "discord.js";

const devamEdenOyunlar = new Map();

export const data = {
    name: "sayi-tahmin",
    description: "🎲 Botun tuttuğu sayıyı tahmin et (1-100)",
    async execute(interaction) {
        const kullaniciId = interaction.user.id;
        
        if (devamEdenOyunlar.has(kullaniciId)) {
            return interaction.reply({ 
                content: "❌ Zaten devam eden bir oyunun var! Önce onu bitir.", 
                ephemeral: true 
            });
        }
        
        const hedefSayi = Math.floor(Math.random() * 100) + 1;
        devamEdenOyunlar.set(kullaniciId, {
            hedef: hedefSayi,
            denemeler: 0,
            baslangic: Date.now()
        });
        
        await interaction.reply("🎲 **1-100 arasında bir sayı tuttum!** Tahminini yaz (sadece sayı):");
        
        const filter = m => m.author.id === kullaniciId && !isNaN(m.content) && m.content > 0 && m.content <= 100;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 10 });
        
        collector.on('collect', async msg => {
            const oyun = devamEdenOyunlar.get(kullaniciId);
            if (!oyun) return collector.stop();
            
            const tahmin = parseInt(msg.content);
            oyun.denemeler++;
            
            if (tahmin === oyun.hedef) {
                const sure = ((Date.now() - oyun.baslangic) / 1000).toFixed(1);
                await msg.reply(`🎉 **Tebrikler!** Doğru tahmin! Sayı **${oyun.hedef}** idi.\n📊 Deneme: ${oyun.denemeler} | ⏱️ Süre: ${sure}s`);
                devamEdenOyunlar.delete(kullaniciId);
                collector.stop();
            } else if (tahmin < oyun.hedef) {
                await msg.reply("📈 **Daha büyük** bir sayı söyle!");
            } else {
                await msg.reply("📉 **Daha küçük** bir sayı söyle!");
            }
        });
        
        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const oyun = devamEdenOyunlar.get(kullaniciId);
                if (oyun) {
                    await interaction.followUp(`⏰ Süre doldu! Tutulan sayı **${oyun.hedef}** idi.`);
                    devamEdenOyunlar.delete(kullaniciId);
                }
            }
        });
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("sayi-tahmin")
    .setDescription("🎲 Botun tuttuğu sayıyı tahmin et (1-100)");