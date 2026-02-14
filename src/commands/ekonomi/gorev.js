import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

// commands/gorev.js (sadece DAILY_QUESTS kısmını güncelle)
const DAILY_QUESTS = [
  // Mevcut görevler (güncellendi)
  { id: "send_messages", name: "💬 Mesaj Gönder", description: "10 mesaj gönder", target: 10, reward: 100, xp_reward: 50, emoji: "💬" },
  { id: "voice_time", name: "🎤 Seste Kal", description: "30 dakika seste kal", target: 30, reward: 150, xp_reward: 75, emoji: "🎤" },
  { id: "gamble", name: "🎰 Kumar Oyna", description: "3 kumar oyunu oyna", target: 3, reward: 200, xp_reward: 100, emoji: "🎰" },
  { id: "spend_money", name: "💰 Para Harca", description: "500 ZenCoin harca", target: 500, reward: 250, xp_reward: 125, emoji: "💰" },
  { id: "transfer", name: "💸 Transfer Yap", description: "1 başarılı transfer yap", target: 1, reward: 300, xp_reward: 150, emoji: "💸" },
  
  // ✨ YENİ GÖREVLER
  { id: "level_up", name: "📈 Seviye Atla", description: "1 seviye atla", target: 1, reward: 500, xp_reward: 200, emoji: "📈" },
  { id: "daily_streak", name: "🔥 Günlük Seri", description: "Günlük ödülünü al (3 gün üst üste)", target: 3, reward: 400, xp_reward: 150, emoji: "🔥" },
  { id: "stock_buy", name: "📊 Hisse Al", description: "1 hisse senedi al", target: 1, reward: 200, xp_reward: 75, emoji: "📊" },
  { id: "pet_feed", name: "🦊 Evcil Hayvan Besle", description: "Evcil hayvanını 2 kere besle", target: 2, reward: 250, xp_reward: 100, emoji: "🦊" },
  { id: "market_purchase", name: "🛒 Market Alışverişi", description: "Marketten 1 eşya al", target: 1, reward: 300, xp_reward: 125, emoji: "🛒" },
];
export const data = {
  name: "gorev",
  description: "Günlük görevlerini görüntüle ve tamamla!",
  
  async execute(interaction) {
    try {
      const guildId = interaction.guild.id;
      const userId = interaction.user.id;
      const userKey = `stats_${guildId}_${userId}`;
      
      // 🔁 Asenkron get
      let userData = await db.get(userKey);
      
      if (!userData) {
        userData = { 
          cash: 0, 
          msg_lv: 1, 
          quests: { daily: {}, weekly: {} },
          total_messages: 0,
          total_voice: 0,
          total_spent: 0,
          total_gambles: 0,
          total_transfers: 0
        };
        await db.set(userKey, userData);
      }
      
      if (!userData.quests) userData.quests = { daily: {}, weekly: {} };
      
      const today = new Date().toDateString();
      const lastReset = userData.quests.lastReset || "";
      
      if (lastReset !== today) {
        userData.quests.daily = {};
        userData.quests.lastReset = today;
        
        const shuffled = [...DAILY_QUESTS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        for (const quest of selected) {
          userData.quests.daily[quest.id] = {
            ...quest,
            progress: 0,
            completed: false
          };
        }
        
        await db.set(userKey, userData);
      }
      
      const dailyQuests = Object.values(userData.quests.daily);
      
      if (dailyQuests.length === 0) {
        return interaction.reply({ content: "📋 Bugün için görev bulunmuyor! Yarın tekrar kontrol et.", ephemeral: true });
      }
      
      let description = "**📋 GÜNLÜK GÖREVLER**\n";
      description += "────────────────\n\n";
      
      let allCompleted = true;
      
      for (const quest of dailyQuests) {
        const progress = quest.progress || 0;
        const target = quest.target;
        const percentage = Math.min(100, Math.floor((progress / target) * 100));
        
        let progressBar = "";
        for (let i = 0; i < 10; i++) {
          progressBar += i < Math.floor(percentage / 10) ? "█" : "░";
        }
        
        const status = quest.completed ? "✅ **TAMAMLANDI!**" : `⏳ ${progressBar} ${progress}/${target}`;
        description += `${quest.emoji} **${quest.name}**\n`;
        description += `└ 📝 ${quest.description}\n`;
        description += `└ ${status}\n`;
        description += `└ 🎁 ${quest.reward} ZenCoin | ✨ ${quest.xp_reward} XP\n\n`;
        
        if (!quest.completed) allCompleted = false;
      }
      
      if (allCompleted) {
        description += "\n🎉 **TÜM GÖREVLER TAMAMLANDI!**\n";
        description += "💎 Yarın yeni görevler gelecek!\n";
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle(`📋 ${interaction.user.username}'ın Görevleri`)
        .setDescription(description)
        .setFooter({ text: "/gorev-odul ile tamamladığın görevlerin ödülünü al!", iconURL: interaction.guild.iconURL() })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("❌ Görev komutu hatası:", error);
      return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
    }
  }
};

export const data2 = {
  name: "gorev-odul",
  description: "Tamamladığın görevlerin ödülünü al!",
  
  async execute(interaction) {
    try {
      const guildId = interaction.guild.id;
      const userId = interaction.user.id;
      const userKey = `stats_${guildId}_${userId}`;
      
      let userData = await db.get(userKey);
      
      if (!userData || !userData.quests || !userData.quests.daily) {
        return interaction.reply({ content: "📭 Aktif görevin bulunmuyor!", ephemeral: true });
      }
      
      const dailyQuests = Object.values(userData.quests.daily);
      let totalReward = 0;
      let totalXP = 0;
      let completedCount = 0;
      
      for (const quest of dailyQuests) {
        if (quest.completed && !quest.claimed) {
          totalReward += quest.reward;
          totalXP += quest.xp_reward;
          quest.claimed = true;
          completedCount++;
        }
      }
      
      if (completedCount === 0) {
        return interaction.reply({ content: "📭 Ödül alabileceğin tamamlanmış görev yok!", ephemeral: true });
      }
      
      userData.cash += totalReward;
      userData.total_earned += totalReward;
      userData.msg_xp += totalXP;
      
      let levelUps = 0;
      while (userData.msg_xp >= (userData.msg_lv * 500)) {
        userData.msg_lv++;
        userData.msg_xp -= (userData.msg_lv * 500);
        levelUps++;
      }
      
      await db.set(userKey, userData);
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle("🎁 **GÖREV ÖDÜLLERİ**")
        .setDescription(`${interaction.user} **${completedCount}** görevi tamamladı!`)
        .addFields(
          { name: "💰 ZenCoin", value: `+${totalReward.toLocaleString()}`, inline: true },
          { name: "✨ XP", value: `+${totalXP}`, inline: true },
          { name: "📊 Yeni Level", value: `${userData.msg_lv} ${levelUps > 0 ? `(+${levelUps})` : ""}`, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("❌ Görev-ödül komutu hatası:", error);
      return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
    }
  }
};