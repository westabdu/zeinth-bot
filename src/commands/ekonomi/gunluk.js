import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

// 🎁 STREAK ÖDÜL TABLOSU (Belirli günlerde büyük ödüller)
const STREAK_REWARDS = {
  1: 100,
  3: 250,
  5: 500,
  7: 1000,
  14: 2500,
  21: 5000,
  30: 10000,
  50: 25000,
  69: 42000, // 😎
  100: 100000,
  365: 500000 // 1 yıl! 🎉
};

// 🎲 Rastgele bonus olayları
const RANDOM_BONUSES = [
  { name: "🍀 Şanslı Gün", min: 1.5, max: 2.0, chance: 10, emoji: "🍀" },
  { name: "✨ Büyük İkramiye", min: 2.0, max: 3.0, chance: 5, emoji: "✨" },
  { name: "💎 Elmas Günü", min: 3.0, max: 5.0, chance: 2, emoji: "💎" },
  { name: "🎰 Jackpot!", min: 5.0, max: 10.0, chance: 1, emoji: "🎰" }
];

// 🎯 Günlük görev tamamlamadan alınabilecek ekstra ödüller
const DAILY_QUESTS = [
  { id: "message", name: "💬 Mesaj Gönder", target: 10, reward: 200, emoji: "💬" },
  { id: "voice", name: "🎤 Seste Kal", target: 30, reward: 300, emoji: "🎤" },
  { id: "gamble", name: "🎲 Kumar Oyna", target: 3, reward: 400, emoji: "🎲" },
  { id: "transfer", name: "💸 Transfer Yap", target: 1, reward: 500, emoji: "💸" }
];

export const data = {
  name: "günlük",
  description: "📆 Günlük ödülünü al! Streak ile daha fazla kazan, sürpriz bonuslar yakala!",
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const userKey = `stats_${guildId}_${userId}`;
    
    // 📥 Kullanıcı verisini al
    let userData = db.get(userKey);
    if (!userData) {
      userData = { 
        cash: 0, 
        bank: 0,
        daily_streak: 0, 
        last_daily: 0,
        total_dailies: 0,
        daily_quests: {},
        daily_multiplier: 1,
        daily_multiplier_expires: 0
      };
      db.set(userKey, userData);
    }

    // ⏳ Cooldown kontrolü (24 saat)
    const cooldown = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastDaily = userData.last_daily || 0;
    const timeDiff = now - lastDaily;

    if (timeDiff < cooldown) {
      const kalan = cooldown - timeDiff;
      const saat = Math.floor(kalan / (60 * 60 * 1000));
      const dakika = Math.floor((kalan % (60 * 60 * 1000)) / (60 * 1000));
      
      // 🕒 Özel mesajlar
      const cooldownMessages = [
        "Bugünlük harçlığını zaten aldın!",
        "Cebindeki paralar daha soğumadı!",
        "Yarın yine gel, yine verelim!",
        "Biraz sabır, ekonomi bir günde düzelmez!"
      ];
      
      return interaction.reply({ 
        content: `⏱️ ${cooldownMessages[Math.floor(Math.random() * cooldownMessages.length)]} **${saat} saat ${dakika} dakika** sonra tekrar gel.`, 
        ephemeral: true 
      });
    }

    // 🔥 STREAK HESAPLAMA
    let streak = userData.daily_streak || 0;
    
    // 48 saat geçmişse streak sıfırlanır, değilse devam eder
    if (timeDiff < cooldown * 2) {
      streak += 1;
    } else {
      streak = 1; // Sıfırlandı ve 1'den başladı
    }

    // 📊 BASE ÖDÜL (Level ile artar)
    let baseReward = 100;
    
    // Level bonusu (Her level +2 ZenCoin, max 500)
    const userLevel = userData.msg_lv || 1;
    const levelBonus = Math.min(userLevel * 2, 500);
    
    // 💎 Streak çarpanı
    let streakMultiplier = 1.0;
    if (streak >= 100) streakMultiplier = 5.0;
    else if (streak >= 50) streakMultiplier = 4.0;
    else if (streak >= 30) streakMultiplier = 3.5;
    else if (streak >= 20) streakMultiplier = 3.0;
    else if (streak >= 14) streakMultiplier = 2.5;
    else if (streak >= 10) streakMultiplier = 2.0;
    else if (streak >= 7) streakMultiplier = 1.8;
    else if (streak >= 5) streakMultiplier = 1.5;
    else if (streak >= 3) streakMultiplier = 1.2;
    
    // 🎟️ Marketten alınan daily multiplier
    if (userData.daily_multiplier > 1 && userData.daily_multiplier_expires > now) {
      streakMultiplier *= userData.daily_multiplier;
    }
    
    // 🎁 Streak ödülü (belirli günlerde ekstra bonus)
    let streakBonus = 0;
    if (STREAK_REWARDS[streak]) {
      streakBonus = STREAK_REWARDS[streak];
    }
    
    // 🎲 RASTGELE BONUS OLAYI
    let randomBonus = { name: "", multiplier: 1.0, emoji: "" };
    const randomChance = Math.random() * 100;
    let cumulative = 0;
    
    for (const bonus of RANDOM_BONUSES) {
      cumulative += bonus.chance;
      if (randomChance < cumulative) {
        const bonusMultiplier = bonus.min + Math.random() * (bonus.max - bonus.min);
        randomBonus = {
          name: bonus.name,
          multiplier: bonusMultiplier,
          emoji: bonus.emoji
        };
        streakMultiplier *= bonusMultiplier;
        break;
      }
    }
    
    // 💰 TOPLAM ÖDÜL HESAPLAMA
    const totalReward = Math.floor((baseReward + levelBonus) * streakMultiplier) + streakBonus;
    
    // 🎫 Ekstra ödül şansı (Streak kutusu)
    let extraReward = 0;
    let extraItem = null;
    
    // Her 5 günde bir bonus kasa
    if (streak % 5 === 0) {
      extraReward = Math.floor(totalReward * 0.5); // %50 ekstra
      
      // %20 şansla eşya düşer
      if (Math.random() < 0.2) {
        const items = [
          { id: "lootbox_common", name: "📦 Common Kasa" },
          { id: "xp_boost", name: "⚡ XP Boost" },
          { id: "transfer_tax_free", name: "💸 Komisyonsuz Transfer" }
        ];
        extraItem = items[Math.floor(Math.random() * items.length)];
        
        if (!userData.inventory) userData.inventory = [];
        userData.inventory.push({
          id: extraItem.id,
          name: extraItem.name,
          purchasedAt: now,
          used: false
        });
      }
    }
    
    // Her 10 günde bir büyük bonus
    if (streak % 10 === 0) {
      extraReward += Math.floor(totalReward * 0.2);
    }
    
    // 💸 Ödülleri ver
    userData.cash = (userData.cash || 0) + totalReward + extraReward;
    userData.total_earned = (userData.total_earned || 0) + totalReward + extraReward;
    userData.daily_streak = streak;
    userData.last_daily = now;
    userData.total_dailies = (userData.total_dailies || 0) + 1;
    
    db.set(userKey, userData);
    
    // 🎨 EMBED oluştur
    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(randomBonus.multiplier > 1.0 
        ? `${randomBonus.emoji} **${randomBonus.name}!** ${randomBonus.emoji}`
        : "📆 **GÜNLÜK ÖDÜL**")
      .setDescription(`${interaction.user} bugünkü ödülünü aldı! ${streakBonus > 0 ? `**${streak} günlük streak ödülü!** 🎉` : ""}`)
      .addFields(
        { name: "💰 Kazanç", value: `**${(totalReward + extraReward).toLocaleString()} ZenCoin**`, inline: true },
        { name: "🔥 Streak", value: `**${streak} gün**`, inline: true },
        { name: "⚡ Çarpan", value: `x${streakMultiplier.toFixed(1)}`, inline: true }
      )
      .setTimestamp();
    
    // Detaylı bilgiler
    let detailText = [];
    detailText.push(`📊 **Base:** ${baseReward} | **Level Bonus:** +${levelBonus}`);
    
    if (streakMultiplier > 1.0) {
      detailText.push(`🎯 **Streak Çarpanı:** x${(streakMultiplier / (randomBonus.multiplier > 1.0 ? randomBonus.multiplier : 1)).toFixed(1)}`);
    }
    
    if (randomBonus.multiplier > 1.0) {
      detailText.push(`${randomBonus.emoji} **${randomBonus.name}:** x${randomBonus.multiplier.toFixed(1)}`);
    }
    
    if (streakBonus > 0) {
      detailText.push(`🎁 **Streak Ödülü:** +${streakBonus.toLocaleString()}`);
    }
    
    if (extraReward > 0) {
      detailText.push(`✨ **Ekstra Bonus:** +${extraReward.toLocaleString()}`);
    }
    
    if (extraItem) {
      detailText.push(`📦 **Kasa Kazandın!** \`${extraItem.name}\``);
    }
    
    embed.addFields({ name: "📋 Detay", value: detailText.join("\n"), inline: false });
    
    // 🎯 Günlük görevler (henüz tamamlanmadıysa göster)
    const today = new Date().toDateString();
    if (!userData.daily_quests?.[today]) {
      userData.daily_quests = userData.daily_quests || {};
      userData.daily_quests[today] = [];
      
      // Rastgele 2 görev seç
      const shuffled = [...DAILY_QUESTS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);
      
      for (const quest of selected) {
        userData.daily_quests[today].push({
          ...quest,
          progress: 0,
          completed: false,
          claimed: false
        });
      }
      db.set(userKey, userData);
    }
    
    // Görevleri göster
    const todaysQuests = userData.daily_quests?.[today] || [];
    if (todaysQuests.length > 0) {
      let questText = "";
      for (const quest of todaysQuests) {
        if (!quest.completed) {
          questText += `${quest.emoji} **${quest.name}** ${quest.progress}/${quest.target} - 🎁 ${quest.reward} ZenCoin\n`;
        }
      }
      if (questText) {
        embed.addFields({ 
          name: "🎯 GÜNLÜK GÖREVLER", 
          value: questText + "\n`/görev-tamamla` ile ödülü al!", 
          inline: false 
        });
      }
    }
    
    // Sıradaki streak ödülü
    let nextStreakReward = null;
    for (const [day, reward] of Object.entries(STREAK_REWARDS)) {
      if (parseInt(day) > streak) {
        nextStreakReward = { day: parseInt(day), reward };
        break;
      }
    }
    
    if (nextStreakReward) {
      embed.setFooter({ 
        text: `🎯 ${nextStreakReward.day} günde +${nextStreakReward.reward.toLocaleString()} | Toplam: ${userData.total_dailies} gün` 
      });
    } else {
      embed.setFooter({ text: `📆 Toplam ${userData.total_dailies} gün` });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};

export const slash_data = new SlashCommandBuilder()
  .setName("günlük")
  .setDescription("📆 Günlük ödülünü al! Streak ile daha fazla kazan!");