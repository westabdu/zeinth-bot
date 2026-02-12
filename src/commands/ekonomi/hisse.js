import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const STOCKS = {
    zenith: { name: "Zenith Teknoloji", basePrice: 150, volatility: 0.1, emoji: "🏢" },
    cryptocoin: { name: "CryptoCoin", basePrice: 4500, volatility: 0.3, emoji: "₿" },
    gold: { name: "Altın", basePrice: 300, volatility: 0.05, emoji: "🪙" },
    oil: { name: "Petrol", basePrice: 200, volatility: 0.15, emoji: "🛢️" }
};

let currentPrices = {};
function updatePrices() {
    for (const [id, stock] of Object.entries(STOCKS)) {
        const change = (Math.random() * 2 - 1) * stock.volatility;
        let price = currentPrices[id] || stock.basePrice;
        price = Math.max(10, Math.floor(price * (1 + change)));
        currentPrices[id] = price;
    }
}
updatePrices();

export const data = {
    name: "hisse",
    description: "Hisse senedi / kripto al-sat yap.",
    async execute(interaction) {
        try {
            const sub = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            const userId = interaction.user.id;
            const userKey = `stats_${guildId}_${userId}`;
            let userData = db.get(userKey) || { cash: 0, stocks: {} };

            if (sub === "piyasa") {
                updatePrices();
                const embed = new EmbedBuilder().setColor(0xF1C40F).setTitle("📊 Hisse Piyasası").setDescription("Güncel fiyatlar (her sorguda değişir)").setTimestamp();
                for (const [id, stock] of Object.entries(STOCKS)) {
                    embed.addFields({ name: `${stock.emoji} ${stock.name} (\`${id}\`)`, value: `**${currentPrices[id]}** ZenCoin`, inline: true });
                }
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === "al") {
                const id = interaction.options.getString("sembol");
                const miktar = interaction.options.getInteger("miktar");
                const stock = STOCKS[id];
                if (!stock) return interaction.reply({ content: "❌ Geçersiz sembol!", ephemeral: true });
                const fiyat = currentPrices[id];
                const toplamMaliyet = fiyat * miktar;

                if (userData.cash < toplamMaliyet) {
                    return interaction.reply({ content: `❌ Yetersiz bakiye! İhtiyacın: **${toplamMaliyet.toLocaleString()} ZenCoin**`, ephemeral: true });
                }

                userData.cash -= toplamMaliyet;
                userData.total_spent = (userData.total_spent || 0) + toplamMaliyet;
                if (!userData.stocks) userData.stocks = {};
                userData.stocks[id] = (userData.stocks[id] || 0) + miktar;
                db.set(userKey, userData);
                return interaction.reply({ content: `✅ **${miktar} adet ${stock.name}** aldın! Maliyet: **${toplamMaliyet.toLocaleString()} ZenCoin**`, ephemeral: true });
            }

            if (sub === "sat") {
                const id = interaction.options.getString("sembol");
                const miktar = interaction.options.getInteger("miktar");
                const stock = STOCKS[id];
                if (!stock) return interaction.reply({ content: "❌ Geçersiz sembol!", ephemeral: true });
                if (!userData.stocks?.[id] || userData.stocks[id] < miktar) {
                    return interaction.reply({ content: `❌ Portföyünde bu kadar **${stock.name}** yok!`, ephemeral: true });
                }

                const fiyat = currentPrices[id];
                const toplamGelir = fiyat * miktar;
                userData.stocks[id] -= miktar;
                userData.cash += toplamGelir;
                userData.total_earned += toplamGelir;
                db.set(userKey, userData);
                return interaction.reply({ content: `✅ **${miktar} adet ${stock.name}** sattın! Gelir: **${toplamGelir.toLocaleString()} ZenCoin**`, ephemeral: true });
            }

            if (sub === "portföy") {
                if (!userData.stocks || Object.keys(userData.stocks).length === 0) {
                    return interaction.reply({ content: "📭 Portföyünde hisse yok.", ephemeral: true });
                }
                updatePrices();
                let totalValue = 0;
                let desc = "**📈 Portföyün**\n\n";
                for (const [id, adet] of Object.entries(userData.stocks)) {
                    if (adet <= 0) continue;
                    const stock = STOCKS[id];
                    if (!stock) continue;
                    const deger = adet * currentPrices[id];
                    totalValue += deger;
                    desc += `${stock.emoji} **${stock.name}** \`${adet} adet\`\n└ Fiyat: ${currentPrices[id]} | Toplam: ${deger.toLocaleString()} ZenCoin\n`;
                }
                desc += `\n**Toplam Değer:** ${totalValue.toLocaleString()} ZenCoin`;
                const embed = new EmbedBuilder().setColor(0x2ECC71).setTitle(`👤 ${interaction.user.username} Portföyü`).setDescription(desc).setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Hisse komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("hisse")
    .setDescription("Hisse senedi / kripto al-sat")
    .addSubcommand(sub => sub.setName("piyasa").setDescription("Güncel fiyatları göster"))
    .addSubcommand(sub => sub.setName("portföy").setDescription("Portföyünü göster"))
    .addSubcommand(sub => sub.setName("al").setDescription("Hisse al").addStringOption(opt => opt.setName("sembol").setDescription("Hisse sembolü").setRequired(true)).addIntegerOption(opt => opt.setName("miktar").setDescription("Adet").setRequired(true).setMinValue(1)))
    .addSubcommand(sub => sub.setName("sat").setDescription("Hisse sat").addStringOption(opt => opt.setName("sembol").setDescription("Hisse sembolü").setRequired(true)).addIntegerOption(opt => opt.setName("miktar").setDescription("Adet").setRequired(true).setMinValue(1)));