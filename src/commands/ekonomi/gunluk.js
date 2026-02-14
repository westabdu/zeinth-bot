import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const STREAK_REWARDS = { 1: 100, 3: 250, 5: 500, 7: 1000, 14: 2500, 21: 5000, 30: 10000, 50: 25000, 69: 42000, 100: 100000, 365: 500000 };
const RANDOM_BONUSES = [
  { name: "🍀 Şanslı Gün", min: 1.5, max: 2.0, chance: 10, emoji: "🍀" },
  { name: "✨ Büyük İkramiye", min: 2.0, max: 3.0, chance: 5, emoji: "✨" },
  { name: "💎 Elmas Günü", min: 3.0, max: 5.0, chance: 2, emoji: "💎" },
  { name: "🎰 Jackpot!", min: 5.0, max: 10.0, chance: 1, emoji: "🎰" }
];
const DAILY_QUESTS = [
  { id: "msg_50", name: "Sohbet Canavarı", target: 50, reward: 500, emoji: "💬" },
  { id: "work_3", name: "Çalışkan İşçi", target: 3, reward: 300, emoji: "⚒️" },
  { id: "gamble_5", name: "Risk Budalası", target: 5, reward: 400, emoji: "🎲" }
];

export const data = {
  name: "günlük",
  description: "Günlük ödülünü al ve görevlerini kontrol et!",
  
  async execute(interaction) {
    try {
      const guildId = interaction.guild.id;
      const userId = interaction.user.id;
      const userKey = `stats_${guildId}_${userId}`;

      let userData = await db.get(userKey);

      if (!userData) {
          userData = { cash: 0, bank: 0, last_daily: null, streak: 0, total_dailies: 0, daily_quests: {} };
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastDaily = userData.last_daily;

      if (lastDaily === today) {
        return interaction.reply({ content: `❌ Bugünlük ödülünü zaten aldın aga! Yarın tekrar gel.`, ephemeral: true });
      }

      let streak = userData.streak || 0;
      if (lastDaily) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDaily === yesterdayStr) {
          streak++;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }

      let reward = 500;
      let bonusText = "";

      if (STREAK_REWARDS[streak]) {
        reward += STREAK_REWARDS[streak];
        bonusText += `\n🔥 **${streak}. Gün Serisi Bonusu:** +${STREAK_REWARDS[streak]} ZenCoin`;
      }

      const luck = Math.random() * 100;
      let multiplier = 1;
      for (const bonus of RANDOM_BONUSES) {
        if (luck <= bonus.chance) {
          multiplier = Math.random() * (bonus.max - bonus.min) + bonus.min;
          reward = Math.floor(reward * multiplier);
          bonusText += `\n${bonus.emoji} **${bonus.name}!** (x${multiplier.toFixed(2)} çarpan kazandın)`;
          break;
        }
      }

      userData.cash = (userData.cash || 0) + reward;
      userData.last_daily = today;
      userData.streak = streak;
      userData.total_dailies = (userData.total_dailies || 0) + 1;

      if (!userData.daily_quests || !userData.daily_quests[today]) {
        userData.daily_quests = { [today]: [] };
        const shuffled = DAILY_QUESTS.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        
        for (const quest of selected) {
          userData.daily_quests[today].push({ ...quest, progress: 0, completed: false, claimed: false });
        }
      }

      // ✨ QUEST İLERLEMESİ: Günlük seri görevi
      if (userData.quests?.daily) {
        const quests = userData.quests.daily[today] || [];
        let updated = false;
        
        for (const quest of quests) {
          if (quest.id === 'daily_streak' && !quest.completed) {
            if (streak >= quest.target) {
              quest.progress = quest.target;
              quest.completed = true;
              updated = true;
            }
          }
        }
        
        if (updated) await db.set(userKey, userData);
      }

      await db.set(userKey, userData);

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle("🎁 GÜNLÜK ÖDÜL")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`Tebrikler **${interaction.user.username}**!\n\nBugün **${reward.toLocaleString()} ZenCoin** kazandın!${bonusText}`)
        .addFields(
            { name: "🔥 Seri", value: `**${streak}** Gün`, inline: true },
            { name: "💵 Toplam Nakit", value: `**${userData.cash.toLocaleString()}** ZenCoin`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Günlük komutu hatası:", error);
      return interaction.reply({ content: "❌ Bir hata oluştu aga!", ephemeral: true });
    }
  }
};

export const slash_data = new SlashCommandBuilder()
  .setName("günlük")
  .setDescription("Günlük ZenCoin ödülünü alırsın.");