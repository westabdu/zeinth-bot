import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const GAMES = {
  yazitura: {
    winChance: 45,
    multiplier: 2,
    minBet: 10
  },
  zar: {
    winChance: 40,
    multiplier: 2.5,
    minBet: 50
  },
  slots: {
    winChance: 30,
    multiplier: 3,
    minBet: 100
  },
  jackpot: {
    winChance: 5,
    multiplier: 20,
    minBet: 500
  }
};

export const data = {
  name: "kumar",
  description: "Şans oyunları oyna!",
  
  async execute(interaction) {
    try {
      const oyun = interaction.options.getString("oyun") || "yazitura";
      const miktar = interaction.options.getInteger("miktar");
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      
      const game = GAMES[oyun];
      if (!game) {
        return interaction.reply({ content: "❌ Geçersiz oyun! Seçenekler: yazitura, zar, slots, jackpot", ephemeral: true });
      }
      
      if (miktar < game.minBet) {
        return interaction.reply({ content: `❌ Bu oyun için minimum bahis: **${game.minBet} ZenCoin**`, ephemeral: true });
      }
      
      const userKey = `stats_${guildId}_${userId}`;
      let userData = db.get(userKey);
      
      if (!userData) {
        return interaction.reply({ content: "❌ Önce biraz para kazanmalısın!", ephemeral: true });
      }
      
      if (userData.cash < miktar) {
        return interaction.reply({ 
          content: `❌ Hesabında **${(miktar - userData.cash).toLocaleString()} ZenCoin** daha olmalı!`, 
          ephemeral: true 
        });
      }
      
      const levelBonus = Math.min(userData.msg_lv * 0.1, 5);
      const winChance = game.winChance + levelBonus;
      
      let random = Math.random() * 100;
      let won = random <= winChance;
      
      let multiplier = game.multiplier;
      let jackpot = false;
      
      if (!won && Math.random() < 0.01) {
        won = true;
        multiplier = 10;
        jackpot = true;
      }
      
      userData.cash -= miktar;
      userData.total_spent = (userData.total_spent || 0) + miktar;
      userData.total_gambles = (userData.total_gambles || 0) + 1;
      
      let resultEmbed;
      
      if (won) {
        const kazanc = Math.floor(miktar * multiplier);
        userData.cash += kazanc;
        userData.total_earned += kazanc;
        
        resultEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle(jackpot ? "💰💰 **BÜYÜK İKRAMİYE!** 💰💰" : "🎰 **KAZANDIN!**")
          .setDescription(`${interaction.user} **${oyun}** oyununda kazandı!`)
          .addFields(
            { name: "🎲 Bahis", value: `${miktar.toLocaleString()} ZenCoin`, inline: true },
            { name: "💎 Kazanç", value: `${kazanc.toLocaleString()} ZenCoin`, inline: true },
            { name: "📊 Net", value: `**+${(kazanc - miktar).toLocaleString()} ZenCoin**`, inline: true },
            { name: "🎯 Kazanma Şansın", value: `%${winChance.toFixed(1)}`, inline: true },
            { name: "⚡ Çarpan", value: `x${multiplier}`, inline: true }
          )
          .setFooter({ text: `Yeni bakiye: ${userData.cash.toLocaleString()} ZenCoin` })
          .setTimestamp();
        
      } else {
        resultEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle("📉 **KAYBETTİN**")
          .setDescription(`${interaction.user} **${oyun}** oyununda kaybetti...`)
          .addFields(
            { name: "🎲 Bahis", value: `${miktar.toLocaleString()} ZenCoin`, inline: true },
            { name: "💸 Kayıp", value: `**-${miktar.toLocaleString()} ZenCoin**`, inline: true },
            { name: "🎯 Kazanma Şansın", value: `%${winChance.toFixed(1)}`, inline: true }
          )
          .setFooter({ text: `Yeni bakiye: ${userData.cash.toLocaleString()} ZenCoin` })
          .setTimestamp();
      }
      
      db.set(userKey, userData);
      await interaction.reply({ embeds: [resultEmbed] });
    } catch (error) {
      console.error("❌ Kumar komutu hatası:", error);
      return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
    }
  }
};

export const slash_data = new SlashCommandBuilder()
  .setName("kumar")
  .setDescription("Şans oyunları oyna!")
  .addIntegerOption(opt => 
    opt.setName("miktar")
      .setDescription("Yatırılacak ZenCoin")
      .setRequired(true)
      .setMinValue(10))
  .addStringOption(opt =>
    opt.setName("oyun")
      .setDescription("Oyun seç")
      .setRequired(false)
      .addChoices(
        { name: "Yazı Tura (x2, %45)", value: "yazitura" },
        { name: "Zar (x2.5, %40)", value: "zar" },
        { name: "Slot (x3, %30)", value: "slots" },
        { name: "Jackpot (x20, %5)", value: "jackpot" }
      ));