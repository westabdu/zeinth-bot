import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "loto",
    description: "Loto oyna, büyük ikramiyeyi kazan!",
    async execute(interaction) {
        try {
            const sub = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            const userId = interaction.user.id;
            const userKey = `stats_${guildId}_${userId}`;
            let userData = db.get(userKey) || { cash: 0, inventory: [] };

            if (sub === "katıl") {
                const adet = interaction.options.getInteger("adet") || 1;
                if (adet < 1 || adet > 100) return interaction.reply({ content: "❌ 1-100 arası bilet alabilirsin.", ephemeral: true });
                const biletFiyati = 100;
                const toplam = adet * biletFiyati;
                if (userData.cash < toplam) {
                    return interaction.reply({ content: `❌ Yetersiz bakiye! **${toplam.toLocaleString()} ZenCoin** gerekli.`, ephemeral: true });
                }

                userData.cash -= toplam;
                userData.total_spent = (userData.total_spent || 0) + toplam;
                db.set(userKey, userData);

                const poolKey = `lotto_${guildId}`;
                let pool = db.get(poolKey) || { total: 0, tickets: [] };
                pool.total = (pool.total || 0) + toplam;
                for (let i = 0; i < adet; i++) pool.tickets.push({ userId, timestamp: Date.now() });
                db.set(poolKey, pool);

                return interaction.reply({ content: `✅ **${adet}** loto bileti aldın! Toplam ödeme: **${toplam} ZenCoin**`, ephemeral: true });
            }

            if (sub === "bilgi") {
                const poolKey = `lotto_${guildId}`;
                const pool = db.get(poolKey) || { total: 0, tickets: [] };
                const embed = new EmbedBuilder().setColor(0xFFD700).setTitle("🎰 Loto Çekilişi")
                    .addFields({ name: "💰 Büyük İkramiye", value: `${pool.total?.toLocaleString() || 0} ZenCoin`, inline: true },
                              { name: "🎫 Toplam Bilet", value: `${pool.tickets?.length || 0}`, inline: true })
                    .setFooter({ text: "/loto katıl ile bilet al!" }).setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Loto komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("loto")
    .setDescription("Loto sistemi")
    .addSubcommand(sub => sub.setName("katıl").setDescription("Loto bileti al").addIntegerOption(opt => opt.setName("adet").setDescription("Kaç bilet (1-100)").setMinValue(1).setMaxValue(100)))
    .addSubcommand(sub => sub.setName("bilgi").setDescription("Loto havuzunu göster"));