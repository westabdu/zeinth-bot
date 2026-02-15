import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const PETS = {
    kedi: { name: "🐱 Kedi", price: 5000, happiness: 50, income: 10 },
    kopek: { name: "🐶 Köpek", price: 8000, happiness: 60, income: 15 },
    tavsan: { name: "🐰 Tavşan", price: 3000, happiness: 40, income: 5 },
    tilki: { name: "🦊 Tilki", price: 15000, happiness: 80, income: 30 }
};

export const data = {
    name: "pet",
    description: "Evcil hayvan sahiplen, besle, para kazan!",
    async execute(interaction) {
        try {
            const sub = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            const userId = interaction.user.id;
            const userKey = `stats_${guildId}_${userId}`;
            let userData = db.get(userKey) || { cash: 0, pet: null, petHappiness: 50, petLastFed: Date.now(), petLastCollect: 0 };

            if (sub === "liste") {
                const embed = new EmbedBuilder().setTitle("🦊 Sahiplenebileceğin Evcil Hayvanlar").setColor(0xE67E22).setTimestamp();
                for (const [id, pet] of Object.entries(PETS)) {
                    embed.addFields({ name: pet.name, value: `💰 Fiyat: ${pet.price} ZenCoin\n😊 Mutluluk: ${pet.happiness}\n💵 Saatlik Gelir: ${pet.income}`, inline: true });
                }
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === "sahiplen") {
                const petId = interaction.options.getString("hayvan");
                const pet = PETS[petId];
                if (!pet) return interaction.reply({ content: "❌ Geçersiz hayvan!", ephemeral: true });
                if (userData.pet) return interaction.reply({ content: "❌ Zaten bir evcil hayvanın var!", ephemeral: true });
                if ((userData.cash || 0) < pet.price) {
                    return interaction.reply({ content: `❌ Yetersiz bakiye! **${pet.price} ZenCoin** gerekli.`, ephemeral: true });
                }

                userData.cash = (userData.cash || 0) - pet.price;
                userData.total_spent = (userData.total_spent || 0) + pet.price;
                userData.pet = petId;
                userData.petHappiness = pet.happiness;
                userData.petLastFed = Date.now();
                userData.petLastCollect = Date.now();
                db.set(userKey, userData);
                return interaction.reply({ content: `🎉 **${pet.name}** sahiplendin! Onu sev, besle, mutlu et!` });
            }

            if (sub === "besle") {
                if (!userData.pet) return interaction.reply({ content: "❌ Bir evcil hayvanın yok!", ephemeral: true });
                const pet = PETS[userData.pet];
                const beslemeMaliyeti = 50;
                if ((userData.cash || 0) < beslemeMaliyeti) return interaction.reply({ content: `❌ Beslemek için **50 ZenCoin** gerekli!`, ephemeral: true });

                userData.cash = (userData.cash || 0) - beslemeMaliyeti;
                userData.total_spent = (userData.total_spent || 0) + beslemeMaliyeti;
                userData.petHappiness = Math.min(100, (userData.petHappiness || 50) + 20);
                userData.petLastFed = Date.now();
                db.set(userKey, userData);
                return interaction.reply({ content: `🍖 **${pet.name}** beslendi! Mutluluk: %${userData.petHappiness}` });
            }

            if (sub === "bilgi") {
                if (!userData.pet) return interaction.reply({ content: "❌ Bir evcil hayvanın yok!", ephemeral: true });
                const pet = PETS[userData.pet];
                const saat = Math.floor((Date.now() - (userData.petLastFed || 0)) / (1000 * 60 * 60));
                const embed = new EmbedBuilder().setColor(0xF39C12).setTitle(`${pet.name} - Bilgi`)
                    .addFields({ name: "😊 Mutluluk", value: `%${userData.petHappiness || 50}`, inline: true },
                              { name: "⏰ Son Besleme", value: `${saat} saat önce`, inline: true },
                              { name: "💰 Saatlik Gelir", value: `${pet.income} ZenCoin`, inline: true })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === "topla") {
                if (!userData.pet) return interaction.reply({ content: "❌ Bir evcil hayvanın yok!", ephemeral: true });
                const pet = PETS[userData.pet];
                const now = Date.now();
                const lastCollect = userData.petLastCollect || 0;
                const hours = Math.floor((now - lastCollect) / (1000 * 60 * 60));
                if (hours < 1) return interaction.reply({ content: "⏳ Henüz 1 saat dolmadı! Biraz bekle.", ephemeral: true });

                const mutlulukCarpani = (userData.petHappiness || 50) / 100;
                const kazanc = Math.floor(pet.income * hours * mutlulukCarpani);
                userData.cash = (userData.cash || 0) + kazanc;
                userData.total_earned = (userData.total_earned || 0) + kazanc;
                userData.petLastCollect = now;
                db.set(userKey, userData);
                return interaction.reply({ content: `💰 **${kazanc.toLocaleString()} ZenCoin** kazandın! ${pet.name} seni mutlu etti.` });
            }
        } catch (error) {
            console.error("❌ Pet komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("pet")
    .setDescription("Evcil hayvan sistemi")
    .addSubcommand(sub => sub.setName("liste").setDescription("Sahiplenebilecek hayvanlar"))
    .addSubcommand(sub => sub.setName("bilgi").setDescription("Evcil hayvan bilgisi"))
    .addSubcommand(sub => sub.setName("besle").setDescription("Evcil hayvanını besle"))
    .addSubcommand(sub => sub.setName("topla").setDescription("Evcil hayvanının getirdiği parayı topla"))
    .addSubcommand(sub => sub.setName("sahiplen").setDescription("Evcil hayvan sahiplen")
        .addStringOption(opt => opt.setName("hayvan").setDescription("Hayvan türü").setRequired(true)
            .addChoices(...Object.entries(PETS).map(([id, p]) => ({ name: p.name, value: id })))));