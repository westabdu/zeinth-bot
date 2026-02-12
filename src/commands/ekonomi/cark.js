import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const WHEEL_SEGMENTS = [
    { name: "💎 10.000", reward: 10000, chance: 5, emoji: "💎" },
    { name: "💰 1.000", reward: 1000, chance: 15, emoji: "💰" },
    { name: "💵 500", reward: 500, chance: 20, emoji: "💵" },
    { name: "🪙 100", reward: 100, chance: 25, emoji: "🪙" },
    { name: "✨ 50 XP", reward: 50, type: "xp", chance: 15, emoji: "✨" },
    { name: "📦 Common Kasa", reward: "lootbox_common", type: "item", chance: 10, emoji: "📦" },
    { name: "🎫 Loto bileti", reward: "lottery_ticket", type: "item", chance: 8, emoji: "🎫" },
    { name: "🔥 Jackpot!", reward: 50000, chance: 2, emoji: "🔥" }
];

export const data = {
    name: "çark",
    description: "Şans çarkını çevir ve ödül kazan! (Günde 1 kere)",
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;
            const userKey = `stats_${guildId}_${userId}`;
            let userData = db.get(userKey) || { cash: 0, inventory: [], msg_xp: 0, msg_lv: 1 };

            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;
            if (now - (userData.last_spin || 0) < cooldown) {
                const kalan = cooldown - (now - userData.last_spin);
                const saat = Math.floor(kalan / (60 * 60 * 1000));
                const dakika = Math.floor((kalan % (60 * 60 * 1000)) / (60 * 1000));
                return interaction.reply({ content: `⏳ Çarkı tekrar çevirmek için **${saat} saat ${dakika} dakika** bekle.`, ephemeral: true });
            }

            const random = Math.random() * 100;
            let cumulative = 0;
            let selected = WHEEL_SEGMENTS[0];
            for (const seg of WHEEL_SEGMENTS) {
                cumulative += seg.chance;
                if (random < cumulative) { selected = seg; break; }
            }

            let rewardText = "";
            if (selected.type === "xp") {
                userData.msg_xp = (userData.msg_xp || 0) + selected.reward;
                while (userData.msg_xp >= (userData.msg_lv * 500)) {
                    userData.msg_lv++;
                    userData.msg_xp -= (userData.msg_lv * 500);
                }
                rewardText = `✨ **${selected.reward} XP** kazandın!`;
            } else if (selected.type === "item") {
                if (!userData.inventory) userData.inventory = [];
                userData.inventory.push({ id: selected.reward, name: selected.name, purchasedAt: now, used: false });
                rewardText = `📦 **${selected.name}** kazandın!`;
            } else {
                userData.cash = (userData.cash || 0) + selected.reward;
                userData.total_earned = (userData.total_earned || 0) + selected.reward;
                rewardText = `💰 **${selected.reward.toLocaleString()} ZenCoin** kazandın!`;
            }

            userData.last_spin = now;
            db.set(userKey, userData);

            const embed = new EmbedBuilder()
                .setColor(0x9B59B6)
                .setTitle("🎡 Şans Çarkı")
                .setDescription(`${interaction.user} çarkı çevirdi ve **${selected.emoji} ${selected.name}** kazandı!`)
                .addFields({ name: "Ödül", value: rewardText })
                .setFooter({ text: "Yarın tekrar çevirebilirsin!" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Çark komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("çark")
    .setDescription("Günlük şans çarkını çevir!");