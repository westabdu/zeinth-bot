// commands/eglence/saka.js
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "saka",
    description: "😂 Rastgele bir şaka yapar",
    async execute(interaction) {
        const sakalar = [
            "Bir yazılımcı markete gider, '2 kilo elma' der. Pazarcı sorar: 'Neden?'",
            "Neden bilgisayarlar soğuk algınlığına yakalanmaz? Çünkü Windows'ları var!",
            "Bir byte diğerine sormuş: 'Seni biraz AND'ırayım mı?'",
            "Neden Java geliştiricileri gözlük takar? Çünkü C# göremezler!",
            "Bir sunucu odasında iki server konuşuyormuş: 'Benim işlemcim o kadar hızlı ki 1 saniyede milyonlarca işlem yapıyor.' Diğeri cevap vermiş: 'Benimki de öyle ama senin kadar boş konuşmuyor!'",
            "Neden programcılar karanlık modda çalışır? Çünkü ışık böcekleri çeker!",
            "İki CSS özelliği evlenmiş. Çocukları display: none olmuş.",
            "Neden Python yılanı çok sevilir? Çünkü 'print' yapmayı sever!",
            "Bir bilgisayar bilimcisi ne zaman uyur? Hiçbir zaman, çünkü 'stack overflow' olur!",
            "Neden JavaScript geliştiricileri üzgün? Çünkü 'null' sevgilileri var!"
        ];
        
        const rastgeleSaka = sakalar[Math.floor(Math.random() * sakalar.length)];
        
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("😂 Rastgele Şaka")
            .setDescription(rastgeleSaka)
            .setFooter({ text: interaction.user.username })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("saka")
    .setDescription("😂 Rastgele bir şaka yapar");