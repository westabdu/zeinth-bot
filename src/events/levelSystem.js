// 📌 levelSystem.js - DÜZELTİLMİŞ VERSİYON
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
  100: 5000000 // 5 MİLYON! 🚀
};

// 🎁 SES LEVEL ATLAYINCA PARA ÖDÜLÜ
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

// ✨ MESAJ ATINCA PARA KAZAN (COOLDOWN'LU)
const MESSAGE_MONEY = {
  min: 1,
  max: 3,
  cooldown: 60000 // 1 dakika
};

// 🔊 SESTE DURUNCA PARA KAZAN (DAKİKA BAŞI)
const VOICE_MONEY_PER_MINUTE = 2;

// GÜNLÜK STREAK ÖDÜLLERİ
const DAILY_STREAK_REWARDS = {
  1: 100,
  3: 250,
  5: 500,
  7: 1000,
  14: 2500,
  21: 5000,
  30: 10000,
  50: 25000,
  100: 100000
};

export default client => {
  console.log("✅ ULTIMATE LEVEL + EKONOMİ SİSTEMİ YÜKLENDİ!");

  // ========== YARDIMCI FONKSİYONLAR ==========
  async function sendLevelUpMessage(message, newLevel, levelUps) {
    try {
      const guildId = message.guild.id;
      const ayar = await db.get(`level_ayar_${guildId}`);
      if (!ayar || !ayar.kanalId) return;

      const channel = message.guild.channels.cache.get(ayar.kanalId);
      if (!channel) return;

      // Mesajı hazırla
      let msg = ayar.mesaj || "🎉 {user} Level {level}'a ulaştı!";
      msg = msg.replace(/{user}/g, message.author.toString())
               .replace(/{level}/g, newLevel)
               .replace(/{guild}/g, message.guild.name)
               .replace(/{type}/g, "Mesaj");

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle("⬆️ LEVEL ATLADIN!")
        .setDescription(msg)
        .addFields(
          { name: "🎯 Yeni Level", value: `**${newLevel}**`, inline: true },
          { name: "⚡ Atlanan Level", value: `+${levelUps}`, inline: true }
        )
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("❌ Level up mesajı gönderilemedi:", error);
    }
  }

  async function sendVoiceLevelUpMessage(oldState, newLevel) {
    try {
      const guildId = oldState.guild.id;
      const ayar = await db.get(`level_ayar_${guildId}`);
      if (!ayar || !ayar.kanalId) return;

      const channel = oldState.guild.channels.cache.get(ayar.kanalId);
      if (!channel) return;

      const voiceLevelMessages = [
        "🎤 {user} ses seviyesi atladı! Artık **Ses Level {level}**!",
        "🔊 Tebrikler {user}! **Ses Level {level}**'a ulaştın!",
        "🎙️ {user} artık daha yüksek ses seviyesinde! **Level {level}**!",
        "📢 {user} ses gücü arttı! **Ses Level {level}**!",
        "🎧 {user} harika bir ses kalitesi! **Level {level}**!"
      ];
      const randomMsg = voiceLevelMessages[Math.floor(Math.random() * voiceLevelMessages.length)];
      const levelUpMessage = randomMsg
        .replace(/{user}/g, `<@${oldState.id}>`)
        .replace(/{level}/g, newLevel);

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle("🎤 SES LEVEL UP!")
        .setDescription(levelUpMessage)
        .addFields(
          { name: "🎯 Yeni Ses Level", value: `**${newLevel}**`, inline: true },
          { name: "⏱️ Süre", value: `${Math.floor((Date.now() - (oldState.guild.joinedAt || Date.now())) / 60000) || 1} dakika`, inline: true }
        )
        .setThumbnail(oldState.member?.user?.displayAvatarURL())
        .setFooter({ text: oldState.guild.name, iconURL: oldState.guild.iconURL() })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("❌ Ses level-up mesajı gönderilemedi:", error);
    }
  }

  async function checkAndGiveRole(message, newLevel) {
    try {
      const guildId = message.guild.id;
      const key = `level_roles_${guildId}`;
      const levelRoles = (await db.get(key)) || {};

      if (levelRoles[newLevel]) {
        const roleId = levelRoles[newLevel];
        const role = message.guild.roles.cache.get(roleId);
        const member = message.member;

        if (role && member && !member.roles.cache.has(roleId)) {
          await member.roles.add(role);

          // Rol verilince PARA ÖDÜLÜ!
          const dataKey = `stats_${guildId}_${message.author.id}`;
          let data = await db.get(dataKey);
          if (data) {
            const roleReward = Math.floor(newLevel * 50); // Level * 50
            data.cash = (data.cash || 0) + roleReward;
            data.total_earned = (data.total_earned || 0) + roleReward;
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
              if (kanal) await kanal.send({ embeds: [embed] }).catch(() => {});
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Rol verme hatası:", error);
    }
  }

  // ========== MESAJ SİSTEMİ ==========
  client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Cooldown
    const cooldownKey = `cooldown_${message.guild.id}_${message.author.id}`;
    const lastMessage = (await db.get(cooldownKey)) || 0;
    const cooldownTime = 8000;

    if (Date.now() - lastMessage < cooldownTime) return;
    await db.set(cooldownKey, Date.now());

    const guildId = message.guild.id;
    const userId = message.author.id;
    const key = `stats_${guildId}_${userId}`;

    let data = (await db.get(key)) || {
      // Level
      msg_xp: 0,
      msg_lv: 1,
      voice_xp: 0,
      voice_lv: 1,
      total_messages: 0,
      total_voice: 0,

      // Ekonomi
      cash: 0,
      bank: 0,
      total_earned: 0,
      total_spent: 0,

      // Diğer
      daily_streak: 0,
      last_daily: 0,
      quests: { daily: {}, weekly: {} },
      inventory: [],
      job: null,
      job_exp: 0,
      job_level: 1,
      achievements: []
    };

    // --- MESAJ PARA KAZANCI ---
    const lastMoneyTime = (await db.get(`money_cooldown_${guildId}_${userId}`)) || 0;
    if (Date.now() - lastMoneyTime >= MESSAGE_MONEY.cooldown) {
      const moneyEarned = Math.floor(Math.random() * (MESSAGE_MONEY.max - MESSAGE_MONEY.min + 1)) + MESSAGE_MONEY.min;
      data.cash = (data.cash || 0) + moneyEarned;
      data.total_earned = (data.total_earned || 0) + moneyEarned;
      await db.set(`money_cooldown_${guildId}_${userId}`, Date.now());

      // %5 şansla EXTRA BONUS!
      if (Math.random() < 0.05) {
        const bonus = moneyEarned * 5;
        data.cash += bonus;
        data.total_earned += bonus;
        console.log(`💰 ${message.author.tag} BONUS KAZANDI! +${bonus} ZenCoin`);
      }
    }

    // --- XP KAZANCI (level) ---
    data.total_messages = (data.total_messages || 0) + 1;
    data.last_message = Date.now();

    let xpEarned = Math.floor(Math.random() * 11) + 15;
    if (message.content.length > 100) xpEarned += 5;
    if (message.attachments.size > 0) xpEarned += 5;

    data.msg_xp = (data.msg_xp || 0) + xpEarned;

    // Level atlama kontrolü
    let levelUps = 0;
    let oldLevel = data.msg_lv || 1;

    while (data.msg_xp >= (data.msg_lv * 500)) {
      data.msg_lv++;
      data.msg_xp -= (data.msg_lv * 500);
      levelUps++;

      // 🎁 LEVEL ÖDÜLÜ PARA!
      if (LEVEL_REWARDS[data.msg_lv]) {
        const reward = LEVEL_REWARDS[data.msg_lv];
        data.cash = (data.cash || 0) + reward;
        data.total_earned = (data.total_earned || 0) + reward;

        // ÖZEL BİLDİRİM (Büyük ödüllerde)
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
            if (kanal) await kanal.send({ embeds: [embed] }).catch(() => {});
          }
        }
      }

      await checkAndGiveRole(message, data.msg_lv);
    }

    // Eğer level atlandıysa, PARA BİLDİRİMİ
    if (oldLevel !== data.msg_lv) {
      const totalReward = Object.entries(LEVEL_REWARDS)
        .filter(([lvl]) => parseInt(lvl) <= data.msg_lv && parseInt(lvl) > oldLevel)
        .reduce((sum, [_, val]) => sum + val, 0);

      if (totalReward > 0) {
        try {
          await message.channel.send(`💰 **+${totalReward.toLocaleString()} ZenCoin** seviye ödülü!`);
        } catch {}
      }

      await sendLevelUpMessage(message, data.msg_lv, levelUps);
    }

    await db.set(key, data);
  });

  // ========== SES SİSTEMİ ==========
  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.member?.user?.bot || newState.member?.user?.bot) return;

    const guildId = newState.guild?.id || oldState.guild?.id;
    const userId = newState.id || oldState.id;
    if (!guildId || !userId) return;

    const timeKey = `v_time_${guildId}_${userId}`;
    const voiceKey = `stats_${guildId}_${userId}`;

    // Sese girme
    if (!oldState.channelId && newState.channelId) {
      await db.set(timeKey, Date.now());

      // Sese girince %10 şansla küçük bonus
      if (Math.random() < 0.1) {
        let data = await db.get(voiceKey);
        if (data) {
          const bonus = Math.floor(Math.random() * 20) + 10;
          data.cash = (data.cash || 0) + bonus;
          data.total_earned = (data.total_earned || 0) + bonus;
          await db.set(voiceKey, data);
        }
      }
    }

    // Sesten çıkma
    if (oldState.channelId && !newState.channelId) {
      const joinTime = await db.get(timeKey);
      if (joinTime) {
        const minutes = Math.floor((Date.now() - joinTime) / 60000);

        if (minutes > 0) {
          let data = (await db.get(voiceKey)) || {
            msg_xp: 0, msg_lv: 1,
            voice_xp: 0, voice_lv: 1,
            total_voice: 0,
            cash: 0, bank: 0,
            total_earned: 0
          };

          // 🔊 SES XP'si
          const xpPerMinute = oldState.channel?.members?.size === 1 ? 15 : 25;
          data.voice_xp = (data.voice_xp || 0) + minutes * xpPerMinute;
          data.total_voice = (data.total_voice || 0) + minutes;

          // 💰 SES PARASI (DAKİKA BAŞI)
          const moneyEarned = minutes * VOICE_MONEY_PER_MINUTE;
          data.cash = (data.cash || 0) + moneyEarned;
          data.total_earned = (data.total_earned || 0) + moneyEarned;

          // Ses level atlama kontrolü
          let oldVoiceLevel = data.voice_lv || 1;
          while (data.voice_xp >= (data.voice_lv * 500)) {
            data.voice_lv++;
            data.voice_xp -= (data.voice_lv * 500);

            // 🎁 SES LEVEL ÖDÜLÜ
            if (VOICE_LEVEL_REWARDS[data.voice_lv]) {
              const reward = VOICE_LEVEL_REWARDS[data.voice_lv];
              data.cash = (data.cash || 0) + reward;
              data.total_earned = (data.total_earned || 0) + reward;
            }

            await sendVoiceLevelUpMessage(oldState, data.voice_lv);
          }

          await db.set(voiceKey, data);

          // Her 30 dakikada bir BÜYÜK BONUS mesajı
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
  });
};