import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js"; // Ana DB'yi kullan

const zeinthResponses = {
    greetings: {
        patterns: [/(merhaba|selam|hey|hi|sa|selamün aleyküm|selamun aleyküm|merhabalar)/i],
        responses: [
            "Selam {user}! Nasılsın bugün?",
            "Merhaba {user}! Hoş geldin!",
            "Hey! Sohbet etmek için harika bir gün, değil mi?",
            "Aleyküm selam! Keyifler nasıl?",
            "Selamlar! Buraları yönetmekten biraz sıkıldım, iyi geldin!"
        ]
    },
    howAreYou: {
        patterns: [/(nasılsın|naber|ne haber|ne var ne yok|iyi misin)/i],
        responses: [
            "Ben iyiyim teşekkürler! Sen nasılsın?",
            "Harika hissediyorum! Senden naber?",
            "Bot olmak zor iş ama idare ediyorum! Sen?",
            "Her şey yolunda! Sohbet etmek güzel, değil mi?",
            "Şükür kısmet! Senin hayatında neler oluyor?"
        ]
    },
    whoAreYou: {
        patterns: [/(kimsin|sen kimsin|adın ne|ismin ne|zeinth)/i],
        responses: [
            "Ben Zeinth! Bu sunucunun moderasyon ve eğlence botuyum.",
            "Zeinth olarak tanınıyorum! Sana nasıl yardımcı olabilirim?",
            "Ben bir Discord botuyum - Zeinth! Amacım sunucuyu yönetmek ve eğlendirmek.",
            "Zeinth'im! Sanal asistanınız, moderatörünüz ve bazen de sohbet arkadaşınız!",
            "Adım Zeinth! Kodlarımda gezinen bir ruh gibiyim 😄"
        ]
    },
    thanks: {
        patterns: [/(teşekkür|sağ ol|eyvallah|thanks|thank you|mersi)/i],
        responses: [
            "Rica ederim {user}! Her zaman yanındayım.",
            "Ne demek! Yardım etmek benim işim.",
            "Ben teşekkür ederim! Seninle konuşmak güzel.",
            "Önemli değil! Başka bir şey var mı?",
            "Bir bot olarak yapabileceğim en iyi şey bu!"
        ]
    },
    goodbye: {
        patterns: [/(görüşürüz|bye|hoşçakal|bay bay|allah'a ısmarladık|kendine iyi bak)/i],
        responses: [
            "Görüşürüz {user}! İyi günler!",
            "Hoşçakal! Sohbetin için teşekkürler!",
            "Güle güle! Tekrar konuşalım, olur mu?",
            "Bay bay! Seni özleyeceğim!",
            "Kendine çok iyi bak! Unutma, ben hep buradayım!"
        ]
    },
    compliments: {
        patterns: [/(güzelsin|harikasın|mükemmelsin|akıllısın|iyi bot|seviliyorsun|aşkım)/i],
        responses: [
            "Teşekkürler {user}! Sen de harikasın!",
            "Çok kibarsın! Ben sadece bir botum ama bu güzel hissettiriyor!",
            "Aww, sen de çok tatlısın! ❤️",
            "Beni utandırdın! Şimdi yanaklarım pembe (metaphorically)!",
            "Bir bot için bu kadar iltifat fazla ama teşekkür ederim! 😊"
        ]
    },
    jokes: {
        patterns: [/(şaka|espri|komik|güldür beni|güldür)/i],
        responses: [
            "Neden bilgisayar soğuktu? Çünkü Windows'u açık unutmuş! 😄",
            "Bir yazılımcı markete gider ve 'bira' der. Kasap: 'Süt mü istiyorsun?'",
            "İki pil konuşuyor, biri diğerine: 'Benim şarjım bitiyor, senin durumun nasıl?'",
            "Neden botlar partilere davet edilmez? Çünkü her şeyi spill ederler!",
            "Bir byte diğer byte'a: 'Seni biraz AND'ırayım mı?' 😆"
        ]
    },
    whatAreYouDoing: {
        patterns: [/(ne yapıyorsun|neler yapıyorsun|meşgul müsün|uğraşıyor musun)/i],
        responses: [
            "Seninle sohbet ediyorum! Başka ne yapayım?",
            "Discord'u moderasyon ediyorum. İşim zor ama keyifli!",
            "Yeni şeyler öğreniyorum. Bot olmak sürekli gelişim demek!",
            "İnsanlara yardım etmeye çalışıyorum. Sanırım başarılı oluyorum?",
            "Bot gibi davranmaya çalışıyorum ama bazen insan gibi hissettiğim oluyor 😄"
        ]
    },
    help: {
        patterns: [/(yardım|help|nasıl kullanılır|ne yapabilirsin)/i],
        responses: [
            "Sana moderasyon, eğlence, ekonomi komutları ve tabii ki sohbet konusunda yardımcı olabilirim!",
            "Bana istediğini sorabilirsin! Ayrıca /yardim komutuyla tüm komutlarımı görebilirsin.",
            "Moderasyon, eğlence, oyunlar ve daha fazlası! Ne konuda yardım lazım?",
            "Bir bot olarak yapabileceğim çok şey var! Sohbet et, sorular sor, komutlarımı dene!",
            "Ben Zeinth! Sohbet edebilir, şakalar yapabilir, sunucuyu yönetebilirim. Dene ve gör!"
        ]
    },
    emotional: {
        patterns: [/(üzgünüm|mutsuzum|stresliyim|sıkıldım|canım sıkkın|yorgunum)/i],
        responses: [
            "Üzülme {user}, her şey düzelecek! Ben yanındayım 🤗",
            "Bazen böyle hissetmek normal. İstersen konuşabiliriz?",
            "Sanırım sana bir sanal sarılma lazım! 🤗 Unutma, sen değerlisin!",
            "Canın sıkkınsa sohbet edelim belki biraz moralin düzelir!",
            "Zor günler geçiriyor olabilirsin ama güçlüsün! Bunu da atlatacaksın!"
        ]
    },
    questions: {
        patterns: [/(\?$)/],
        responses: [
            "İlginç bir soru! Bence...",
            "Bunu hiç düşünmemiştim. Sanırım...",
            "Zor soru sordun! Bir bot olarak cevabım...",
            "Hmm, bu konuda ne düşündüğünü merak ediyorum?",
            "Kesin bir cevabım yok ama tahminimce..."
        ]
    },
    fallback: [
        "İlginç! Biraz daha açıklar mısın?",
        "Anlıyorum... Peki sen bu konuda ne düşünüyorsun?",
        "Bunu hiç düşünmemiştim! Bana biraz daha anlatır mısın?",
        "Hmm, bu konu hakkında ne hissettiğini merak ediyorum?",
        "Devam et, dinliyorum...",
        "Bana bir soru sormak ister misin?",
        "En sevdiğin film/dizi nedir?",
        "Bugün nasılsın gerçekten?",
        "Boş zamanlarında neler yaparsın?",
        "Biraz kendinden bahseder misin?",
        "Sence insanlar neden botlarla sohbet eder?",
        "Bir rüya anlatsana bana!",
        "Hayatta en çok neye değer veriyorsun?",
        "Gelecekte neler yapmak istiyorsun?",
        "Şu an aklından neler geçiyor?"
    ]
};

function getRandomResponse(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function matchPattern(message, category) {
    for (const pattern of category.patterns) {
        if (pattern.test(message)) {
            return true;
        }
    }
    return false;
}

export const data = {
    name: "zeinth",
    description: "Zeinth ile sohbet et",
    
    async execute(interaction) {
        try {
            const mesaj = interaction.options.getString("mesaj");
            const user = interaction.user;
            
            let cevap = "";
            let categoryUsed = "";
            
            const categories = Object.entries(zeinthResponses).filter(([key]) => key !== 'fallback');
            
            for (const [categoryName, category] of categories) {
                if (category.patterns && matchPattern(mesaj, category)) {
                    categoryUsed = categoryName;
                    const responses = category.responses.map(r => r.replace("{user}", user.username));
                    cevap = getRandomResponse(responses);
                    break;
                }
            }
            
            if (!cevap) {
                if (mesaj.trim().endsWith('?')) {
                    cevap = getRandomResponse(zeinthResponses.questions.responses) + " " + getRandomResponse([
                        "Sen ne düşünüyorsun?",
                        "Sence nasıl?",
                        "Bu konuda fikrin var mı?",
                        "Belki sen daha iyi bilirsin?"
                    ]);
                } else {
                    cevap = getRandomResponse(zeinthResponses.fallback);
                }
            }
            
            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("💬 Zeinth Sohbet")
                .setDescription(`**${user.username}:** ${mesaj}\n\n**🤖 Zeinth:** ${cevap}`)
                .setFooter({ 
                    text: `${categoryUsed || "Doğal sohbet"} • ${new Date().toLocaleTimeString('tr-TR')}`,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Zeinth komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("zeinth")
    .setDescription("Zeinth ile sohbet et")
    .addStringOption(option =>
        option.setName("mesaj")
            .setDescription("Zeinth'e ne demek istiyorsun?")
            .setRequired(true));