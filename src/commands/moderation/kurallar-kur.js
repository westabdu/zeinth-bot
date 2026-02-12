import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = {
    name: "kurallar-kur",
    description: "Sunucu kurallarını bu kanala gönderir.",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const kurallarMetni = `
**🛰️ Zenith Studios | Sunucu Kuralları**

**⚖️ Genel Davranış Kuralları**
• **Saygı ve Hoşgörü:** Diğer üyelere, geliştiricilere ve yetkililere karşı saygılı olun. Dini, dili, ırkı veya kişisel tercihleri üzerinden kimseye saldırı yapılamaz.
• **Tartışma ve Kaos:** Tartışmaları uzatmak, toksiklik yapmak veya huzur kaçırmak yasaktır. Bir sorunun varsa yetkililere bildir, kendi adaletini arama.
• **Uygunsuz İçerik (NSFW):** Sunucu genelinde +18, kan dondurucu veya rahatsız edici içerik paylaşımı kesinlikle yasaktır.

**🚫 Reklam ve Spam**
• **İzinsiz Reklam:** Başka sunucuların, sosyal medya hesaplarının veya ürünlerin reklamını yapmak (DM yoluyla dahil) yasaktır.
• **Spam ve Flood:** Kanalları gereksiz mesajlarla doldurmak, büyük harflerle (CAPS) bağırmak veya sürekli birilerini etiketlemek (mention spam) yasaktır.

**🛡️ Yetki ve Yönetim**
• **Yetkili Kararları:** Yetkililerin verdiği kararlar son karardır. Eğer bir haksızlık olduğunu düşünüyorsan, uygun bir dille üst yönetimle iletişime geçebilirsin.
• **Kural Boşlukları:** Bir durumun kurallarda yazmıyor olması, o davranışın serbest olduğu anlamına gelmez. Sağduyu esastır.

> **Unutma:** Burası bir geliştirme ve topluluk stüdyosu. Kurallar seni kısıtlamak için değil, daha kaliteli bir ortamda bulunman için var.

> *Sunucuya katılan herkes kuralları kabul etmiş sayılır.*
            `;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle("📜 Sunucu Kuralları")
                .setDescription(kurallarMetni)
                .setImage("https://i.ibb.co/tpGXxnCB/logo2.jpg")
                .setTimestamp();

            await interaction.channel.send({ embeds: [embed] });

            return interaction.reply({ 
                content: "✅ Kurallar başarıyla gönderildi!", 
                ephemeral: true 
            });
        } catch (error) {
            console.error("❌ Kurallar-kur komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("kurallar-kur")
    .setDescription("Sunucu kurallarını bu kanala gönderir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);