// 📌 levelSystem.js - BAŞINA EKLE:
import { EmbedBuilder } from "discord.js";
import db from "../utils/database.js";

// 🎁 LEVEL ATLAYINCA PARA ÖDÜLÜ
const LEVEL_REWARDS = {
  1: 100,
  5: 250,
  10: 500,
  15: 1000,
  20: 2500,
  25: 5000,
  30: 10000,
  35: 15000,
  40: 25000,
  45: 50000,
  50: 100000,
  60: 250000,
  70: 500000,
  80: 750000,
  90: 1000000,
  100: 5000000
};

const VOICE_LEVEL_REWARDS = {
  5: 200,
  10: 500,
  15: 1000,
  20: 2500,
  25: 5000,
  30: 10000,
  40: 25000,
  50: 50000
};

const MESSAGE_MONEY = { min: 1, max: 3, cooldown: 60000 };
const VOICE_MONEY_PER_MINUTE = 2;

export default client => {
  console.log("✅ ULTIMATE LEVEL + EKONOMİ SİSTEMİ YÜKLENDİ!");
  
  // --- 💬 MESAJ XP + PARA SİSTEMİ ---
  client.on('messageCreate', async message => {
    try {
      if (message.author.bot || !message.guild) return;
      
      const cooldownKey = `cooldown_${message.guild.id}_${message.author.id}`;
      const lastMessage = await db.get(cooldownKey) || 0;
      const cooldownTime = 8000;
      
      if (Date.now() - lastMessage < cooldownTime) return;
      await db.set(cooldownKey, Date.now());
      
      const guildId = message.guild.id;
      const userId = message.author.id;
      const key = `stats_${guildId}_${userId}`;
      
      let data = await db.get(key) || {
        msg_xp: 0, msg_lv: 1, voice_xp: 0, voice_lv: 1,
        total_messages: 0, total_voice: 0,
        cash: 0, bank: 0, total_earned: 0, total_spent: 0,
        daily_streak: 0, last_daily: 0,
        quests: { daily: {}, weekly: {} },
        inventory: [], job: null, job_exp: 0, job_level: 1, achievements: []
      };
      
      // --- MESAJ PARA KAZANCI ---
      const lastMoneyTime = await db.get(`money_cooldown_${guildId}_${userId}`) || 0;
      if (Date.now() - lastMoneyTime >= MESSAGE_MONEY.cooldown) {
        const moneyEarned = Math.floor(Math.random() * (MESSAGE_MONEY.max - MESSAGE_MONEY.min + 1)) + MESSAGE_MONEY.min;
        data.cash += moneyEarned;
        data.total_earned += moneyEarned;
        await db.set(`money_cooldown_${guildId}_${userId}`, Date.now());
        
        if (Math.random() < 0.05) {
          const bonus = moneyEarned * 5;
          data.cash += bonus;
          data.total_earned += bonus;
          console.log(`💰 ${message.author.tag} BONUS KAZANDI! +${bonus} ZenCoin`);
        }
      }
      
      // --- XP KAZANCI ---
      data.total_messages++;
      data.last_message = Date.now();
      
      let xpEarned = Math.floor(Math.random() * 11) + 15;
      if (message.content.length > 100) xpEarned += 5;
      if (message.attachments.size > 0) xpEarned += 5;
      
      data.msg_xp += xpEarned;
      
      // Level atlama kontrolü
      let oldLevel = data.msg_lv;
      let leveledUp = false;
      
      while (data.msg_xp >= (data.msg_lv * 500)) {
        data.msg_lv++;
        data.msg_xp -= (data.msg_lv * 500);
        leveledUp = true;
        
        if (LEVEL_REWARDS[data.msg_lv]) {
          const reward = LEVEL_REWARDS[data.msg_lv];
          data.cash += reward;
          data.total_earned += reward;
          
          if (reward >= 10000) {
            const embed = new EmbedBuilder()
              .setColor(0xFFD700)
              .setTitle("🎁 **BÜYÜK SEVİYE ÖDÜLÜ!**")
              .setDescription(`${message.author} **Level ${data.msg_lv}**'e ulaştı ve **${reward.toLocaleString()} ZenCoin** kazandı!`)
              .setThumbnail(message.author.displayAvatarURL())
              .setTimestamp();
            
            const ayar = await db.get(`level_ayar_${guildId}`);
            if (ayar?.kanalId) {
              const kanal = message.guild.channels.cache.get(ayar.kanalId);
              if (kanal) kanal.send({ embeds: [embed] }).catch(() => {});
            }
          }
        }
        
        await checkAndGiveRole(message, data.msg_lv);
        await sendLevelUpMessage(message, data.msg_lv);
      }
      
      // ✨ QUEST İLERLEMESİ: Mesaj gönderme görevi
      if (data.quests?.daily) {
        const today = new Date().toDateString();
        const quests = data.quests.daily[today] || [];
        let updated = false;
        
        for (const quest of quests) {
          if (quest.id === 'send_messages' && !quest.completed) {
            quest.progress = (quest.progress || 0) + 1;
            if (quest.progress >= quest.target) quest.completed = true;
            updated = true;
          }
          if (quest.id === 'msg_50' && !quest.completed) {
            quest.progress = (quest.progress || 0) + 1;
            if (quest.progress >= quest.target) quest.completed = true;
            updated = true;
          }
        }
        
        if (updated) await db.set(key, data);
      }
      
      await db.set(key, data);
      
    } catch (error) {
      console.error("❌ Level sistemi mesaj hatası:", error);
    }
  });
  
  // --- 🔊 SES XP + PARA SİSTEMİ ---
  client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
      if (oldState.member?.user?.bot || newState.member?.user?.bot) return;
      
      const guildId = newState.guild?.id || oldState.guild?.id;
      const userId = newState.id || oldState.id;
      if (!guildId || !userId) return;
      
      const timeKey = `v_time_${guildId}_${userId}`;
      const voiceKey = `stats_${guildId}_${userId}`;
      
      if (!oldState.channelId && newState.channelId) {
        await db.set(timeKey, Date.now());
        
        if (Math.random() < 0.1) {
          let data = await db.get(voiceKey);
          if (data) {
            const bonus = Math.floor(Math.random() * 20) + 10;
            data.cash += bonus;
            data.total_earned += bonus;
            await db.set(voiceKey, data);
          }
        }
      }
      
      if (oldState.channelId && !newState.channelId) {
        const joinTime = await db.get(timeKey);
        if (joinTime) {
          const minutes = Math.floor((Date.now() - joinTime) / 60000);
          
          if (minutes > 0) {
            let data = await db.get(voiceKey) || {
              msg_xp: 0, msg_lv: 1, voice_xp: 0, voice_lv: 1,
              total_voice: 0, cash: 0, bank: 0, total_earned: 0
            };
            
            const xpPerMinute = oldState.channel?.members?.size === 1 ? 15 : 25;
            data.voice_xp += minutes * xpPerMinute;
            data.total_voice = (data.total_voice || 0) + minutes;
            
            const moneyEarned = minutes * VOICE_MONEY_PER_MINUTE;
            data.cash += moneyEarned;
            data.total_earned += moneyEarned;
            
            let oldVoiceLevel = data.voice_lv;
            while (data.voice_xp >= (data.voice_lv * 500)) {
              data.voice_lv++;
              data.voice_xp -= (data.voice_lv * 500);
              
              if (VOICE_LEVEL_REWARDS[data.voice_lv]) {
                const reward = VOICE_LEVEL_REWARDS[data.voice_lv];
                data.cash += reward;
                data.total_earned += reward;
              }
              
              await sendVoiceLevelUpMessage(oldState, data.voice_lv);
            }
            
            // ✨ QUEST İLERLEMESİ: Seste kalma görevi
            if (data.quests?.daily) {
              const today = new Date().toDateString();
              const quests = data.quests.daily[today] || [];
              let updated = false;
              
              for (const quest of quests) {
                if ((quest.id === 'voice_time' || quest.id === 'work_3') && !quest.completed) {
                  quest.progress = Math.min(quest.target, (quest.progress || 0) + minutes);
                  if (quest.progress >= quest.target) quest.completed = true;
                  updated = true;
                }
              }
              
              if (updated) await db.set(voiceKey, data);
            }
            
            await db.set(voiceKey, data);
            
            if (minutes >= 30 && minutes % 30 === 0) {
              try {
                const user = await client.users.fetch(userId);
                if (user) {
                  await user.send(`🎧 **${minutes} dakikadır** sestesin! Toplam **${moneyEarned} ZenCoin** kazandın.`).catch(() => {});
                }
              } catch {}
            }
          }
          await db.delete(timeKey);
        }
      }
    } catch (error) {
      console.error("❌ Level sistemi ses hatası:", error);
    }
  });
  
  async function checkAndGiveRole(message, newLevel) {
    try {
      const guildId = message.guild.id;
      const key = `level_roles_${guildId}`;
      const levelRoles = await db.get(key) || {};
      
      if (levelRoles[newLevel]) {
        const roleId = levelRoles[newLevel];
        const role = message.guild.roles.cache.get(roleId);
        const member = message.member;
        
        if (role && member && !member.roles.cache.has(roleId)) {
          await member.roles.add(role);
          
          const dataKey = `stats_${guildId}_${message.author.id}`;
          let data = await db.get(dataKey);
          if (data) {
            const roleReward = Math.floor(newLevel * 50);
            data.cash += roleReward;
            data.total_earned += roleReward;
            await db.set(dataKey, data);
            
            const embed = new EmbedBuilder()
              .setColor(0xFFD700)
              .setTitle("🎭 **SEVİYE ROLÜ KAZANILDI!**")
              .setDescription(`${message.author} **${role.name}** rolünü kazandı!\n💰 **+${roleReward} ZenCoin** ödül!`)
              .setThumbnail(message.author.displayAvatarURL())
              .setTimestamp();
            
            const ayar = await db.get(`level_ayar_${guildId}`);
            if (ayar?.kanalId) {
              const kanal = message.guild.channels.cache.get(ayar.kanalId);
              if (kanal) kanal.send({ embeds: [embed] }).catch(() => {});
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Rol verme hatası:", error);
    }
  }
  
  async function sendLevelUpMessage(message, newLevel) {
    const guildId = message.guild.id;
    const ayar = await db.get(`level_ayar_${guildId}`);
    
    const messages = [
      "🎉 {user} Level {level}'a ulaştı!",
      "🏆 Tebrikler {user}! Level {level}'a yükseldin!",
      "⚡ {user} gücü arttı! Artık Level {level}!"
    ];
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const levelUpMessage = randomMsg
      .replace(/{user}/g, `<@${message.author.id}>`)
      .replace(/{level}/g, newLevel);
    
    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle("📊 LEVEL ATLADIN!")
      .setDescription(levelUpMessage)
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp();
    
    if (ayar?.kanalId) {
      const targetChannel = message.guild.channels.cache.get(ayar.kanalId);
      if (targetChannel?.isTextBased()) {
        await targetChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  }
  
  async function sendVoiceLevelUpMessage(oldState, newLevel) {
    const guildId = oldState.guild.id;
    const ayar = await db.get(`level_ayar_${guildId}`);
    
    const messages = [
      "🎤 {user} ses seviyesi atladı! Artık **Ses Level {level}**!",
      "🔊 Tebrikler {user}! **Ses Level {level}**'a ulaştın!"
    ];
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const levelUpMessage = randomMsg
      .replace(/{user}/g, `<@${oldState.id}>`)
      .replace(/{level}/g, newLevel);
    
    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle("🎤 SES LEVEL UP!")
      .setDescription(levelUpMessage)
      .addFields({ name: "🎯 Yeni Ses Level", value: `**${newLevel}**`, inline: true })
      .setThumbnail(oldState.member?.user?.displayAvatarURL())
      .setTimestamp();
    
    if (ayar?.kanalId) {
      const targetChannel = oldState.guild.channels.cache.get(ayar.kanalId);
      if (targetChannel?.isTextBased()) {
        await targetChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  }
};