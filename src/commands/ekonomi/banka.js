import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
  name: "banka",
  description: "Banka işlemleri yap, faiz kazan!",
  
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const userId = interaction.user.id;
      const userKey = `stats_${guildId}_${userId}`;
      let userData = db.get(userKey);
      
      if (!userData) {
        return interaction.reply({ content: "❌ Önce biraz para kazanmalısın!", ephemeral: true });
      }
      
      if (subcommand === "yatir") {
        const miktar = interaction.options.getInteger("miktar");
        
        if (miktar <= 0) return interaction.reply({ content: "❌ Geçersiz miktar!", ephemeral: true });
        if (userData.cash < miktar) {
          return interaction.reply({ content: `❌ Üzerinde **${miktar} ZenCoin** yok!`, ephemeral: true });
        }
        
        userData.cash -= miktar;
        userData.bank = (userData.bank || 0) + miktar;
        db.set(userKey, userData);
        
        return interaction.reply({ 
          content: `🏦 **${miktar.toLocaleString()} ZenCoin** bankana yatırıldı! Bankada: **${userData.bank.toLocaleString()} ZenCoin**`, 
          ephemeral: true 
        });
        
      } else if (subcommand === "cek") {
        const miktar = interaction.options.getInteger("miktar");
        
        if (miktar <= 0) return interaction.reply({ content: "❌ Geçersiz miktar!", ephemeral: true });
        if ((userData.bank || 0) < miktar) {
          return interaction.reply({ content: `❌ Bankanda **${miktar} ZenCoin** yok!`, ephemeral: true });
        }
        
        userData.bank -= miktar;
        userData.cash += miktar;
        db.set(userKey, userData);
        
        return interaction.reply({ 
          content: `💵 **${miktar.toLocaleString()} ZenCoin** bankandan çekildi! Yeni bakiye: **${userData.cash.toLocaleString()} ZenCoin**`, 
          ephemeral: true 
        });
        
      } else if (subcommand === "faiz") {
        const lastInterest = userData.last_interest || 0;
        const now = Date.now();
        const hoursSince = (now - lastInterest) / (1000 * 60 * 60);
        
        if (hoursSince < 24) {
          const kalan = 24 - hoursSince;
          return interaction.reply({ 
            content: `⏱️ Faiz almak için **${Math.ceil(kalan)} saat** beklemen gerekiyor!`, 
            ephemeral: true 
          });
        }
        
        const bankBalance = userData.bank || 0;
        if (bankBalance < 100) {
          return interaction.reply({ 
            content: "🏦 Bankanda en az **100 ZenCoin** olmalı!", 
            ephemeral: true 
          });
        }
        
        const interest = Math.floor(bankBalance * 0.005);
        userData.bank += interest;
        userData.total_earned += interest;
        userData.last_interest = now;
        db.set(userKey, userData);
        
        return interaction.reply({ 
          content: `🏦 **${interest.toLocaleString()} ZenCoin** faiz kazandın! Bankanda: **${userData.bank.toLocaleString()} ZenCoin**`, 
          ephemeral: true 
        });
        
      } else if (subcommand === "bilgi") {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`🏦 ${interaction.user.username} Banka Bilgisi`)
          .addFields(
            { name: "💵 Nakit", value: `${userData.cash?.toLocaleString() || 0} ZenCoin`, inline: true },
            { name: "🏦 Banka", value: `${userData.bank?.toLocaleString() || 0} ZenCoin`, inline: true },
            { name: "📊 Toplam", value: `${((userData.cash || 0) + (userData.bank || 0)).toLocaleString()} ZenCoin`, inline: true },
            { name: "📈 Günlük Faiz", value: "%0.5", inline: true },
            { name: "💰 Son Faiz", value: userData.last_interest ? `<t:${Math.floor(userData.last_interest / 1000)}:R>` : "Henüz yok", inline: true }
          )
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("❌ Banka komutu hatası:", error);
      return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
    }
  }
};

export const slash_data = new SlashCommandBuilder()
  .setName("banka")
  .setDescription("Banka işlemleri")
  .addSubcommand(sub =>
    sub.setName("yatir")
      .setDescription("Bankaya para yatır")
      .addIntegerOption(opt =>
        opt.setName("miktar")
          .setDescription("Yatırılacak miktar")
          .setRequired(true)
          .setMinValue(1)))
  .addSubcommand(sub =>
    sub.setName("cek")
      .setDescription("Bankadan para çek")
      .addIntegerOption(opt =>
        opt.setName("miktar")
          .setDescription("Çekilecek miktar")
          .setRequired(true)
          .setMinValue(1)))
  .addSubcommand(sub =>
    sub.setName("faiz")
      .setDescription("Günlük faizini al"))
  .addSubcommand(sub =>
    sub.setName("bilgi")
      .setDescription("Banka bilgilerini görüntüle"));