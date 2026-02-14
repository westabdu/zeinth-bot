import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const MARKET_ITEMS = [ /* aynen kalacak */ ];

export const data = {
  name: "market",
  description: "Zenith Market'ten alışveriş yap!",
  
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      
      if (subcommand === "list") {
        await showMarket(interaction);
      } else if (subcommand === "buy") {
        await buyItem(interaction);
      } else if (subcommand === "inventory") {
        await showInventory(interaction);
      }
    } catch (error) {
      console.error("❌ Market komutu hatası:", error);
      return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
    }
  }
};

async function showMarket(interaction) {
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  const userKey = `stats_${guildId}_${userId}`;
  const userData = await db.get(userKey) || { cash: 0, msg_lv: 1 };
  
  let description = `💰 **Bakiyen:** ${(userData.cash || 0).toLocaleString()} ZenCoin\n`;
  description += `📊 **Level:** ${userData.msg_lv || 1}\n\n`;
  description += "**🛒 MARKET ÜRÜNLERİ**\n────────────────\n\n";
  
  for (const item of MARKET_ITEMS) {
    const canBuy = (userData.msg_lv || 1) >= item.level_req;
    const lockEmoji = canBuy ? "✅" : "🔒";
    
    description += `${lockEmoji} **${item.name}** - ${item.price.toLocaleString()} ZenCoin\n`;
    description += `└ 📝 ${item.description}\n`;
    description += `└ 📌 Gereken Level: ${item.level_req}\n`;
    if (item.duration > 0) {
      const unit = item.type === "role" ? "gün" : "dakika";
      description += `└ ⏱️ Süre: ${item.duration} ${unit}\n`;
    }
    description += `└ 🆔 \`${item.id}\`\n\n`;
  }
  
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle("🏪 **ZENİTH MARKET**")
    .setDescription(description.substring(0, 4000))
    .setFooter({ text: "/market buy <id> ile satın al", iconURL: interaction.guild.iconURL() })
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function buyItem(interaction) {
  const itemId = interaction.options.getString("id");
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  const userKey = `stats_${guildId}_${userId}`;
  let userData = await db.get(userKey);
  
  if (!userData) {
    return interaction.reply({ content: "❌ Önce biraz XP kazanmalısın!", ephemeral: true });
  }
  
  const item = MARKET_ITEMS.find(i => i.id === itemId);
  if (!item) {
    return interaction.reply({ content: "❌ Geçersiz ürün ID!", ephemeral: true });
  }
  
  if ((userData.msg_lv || 1) < item.level_req) {
    return interaction.reply({ 
      content: `🔒 Bu ürün için **Level ${item.level_req}** gerekiyor! Senin level: ${userData.msg_lv || 1}`, 
      ephemeral: true 
    });
  }
  
  if ((userData.cash || 0) < item.price) {
    return interaction.reply({ 
      content: `❌ Yetersiz bakiye! İhtiyacın: **${(item.price - (userData.cash || 0)).toLocaleString()} ZenCoin**`, 
      ephemeral: true 
    });
  }
  
  userData.cash = (userData.cash || 0) - item.price;
  userData.total_spent = (userData.total_spent || 0) + item.price;
  userData.total_purchases = (userData.total_purchases || 0) + 1;
  
  if (!userData.inventory) userData.inventory = [];
  
  const purchase = {
    id: item.id,
    name: item.name,
    purchasedAt: Date.now(),
    expiresAt: item.duration > 0 ? Date.now() + (item.duration * 24 * 60 * 60 * 1000) : null,
    used: false
  };
  
  userData.inventory.push(purchase);
  
  // ✨ QUEST İLERLEMESİ: Market alışverişi
  if (userData.quests?.daily) {
    const today = new Date().toDateString();
    const quests = userData.quests.daily[today] || [];
    let updated = false;
    
    for (const quest of quests) {
      if ((quest.id === 'market_purchase' || quest.id === 'spend_money') && !quest.completed) {
        if (quest.id === 'market_purchase') {
          quest.progress = (quest.progress || 0) + 1;
        } else if (quest.id === 'spend_money') {
          quest.progress = Math.min(quest.target, (quest.progress || 0) + item.price);
        }
        if (quest.progress >= quest.target) quest.completed = true;
        updated = true;
      }
    }
    
    if (updated) await db.set(userKey, userData);
  }
  
  await db.set(userKey, userData);
  
  if (item.type === "lootbox") {
    const reward = Math.floor(Math.random() * (item.max_reward - item.min_reward + 1)) + item.min_reward;
    userData.cash = (userData.cash || 0) + reward;
    userData.total_earned = (userData.total_earned || 0) + reward;
    await db.set(userKey, userData);
    
    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle("📦 **KASA AÇILDI!**")
      .setDescription(`${interaction.user} **${item.name}** açtı!`)
      .addFields(
        { name: "💰 Kazanç", value: `**${reward.toLocaleString()} ZenCoin**`, inline: true },
        { name: "💸 Ödenen", value: `**${item.price.toLocaleString()} ZenCoin**`, inline: true },
        { name: "📊 Net", value: `**${(reward - item.price).toLocaleString()} ZenCoin**`, inline: true }
      )
      .setColor(reward - item.price > 0 ? 0x00FF00 : 0xFF0000)
      .setTimestamp();
    
    if (item.bonus_role && reward >= item.max_reward * 0.8) {
      embed.addFields({ name: "🎭 Bonus", value: `**${item.bonus_role}** rolü kazandın!`, inline: false });
    }
    
    return interaction.reply({ embeds: [embed] });
  }
  
  await interaction.reply({ 
    content: `✅ **${item.name}** başarıyla satın alındı! Envanterine eklendi.`, 
    ephemeral: true 
  });
}

async function showInventory(interaction) {
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  const userKey = `stats_${guildId}_${userId}`;
  const userData = await db.get(userKey);
  
  if (!userData || !userData.inventory || userData.inventory.length === 0) {
    return interaction.reply({ content: "📭 Envanterin boş!", ephemeral: true });
  }
  
  let desc = "**📦 ENVANTERİN**\n\n";
  const now = Date.now();
  
  for (const item of userData.inventory) {
    if (item.used) continue;
    const expiresIn = item.expiresAt ? Math.ceil((item.expiresAt - now) / (24 * 60 * 60 * 1000)) : null;
    desc += `• **${item.name}**\n`;
    desc += `  └ 🆔 \`${item.id}\`\n`;
    if (expiresIn) {
      desc += `  └ ⏰ ${expiresIn} gün kaldı\n`;
    }
    desc += "\n";
  }
  
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`👤 ${interaction.user.username}'ın Envanteri`)
    .setDescription(desc || "Kullanılabilir eşya yok.")
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

export const slash_data = new SlashCommandBuilder()
  .setName("market")
  .setDescription("Zenith Market sistemi")
  .addSubcommand(sub => sub.setName("list").setDescription("Market ürünlerini listele"))
  .addSubcommand(sub => sub.setName("buy").setDescription("Ürün satın al").addStringOption(opt => opt.setName("id").setDescription("Satın alınacak ürün ID'si").setRequired(true)))
  .addSubcommand(sub => sub.setName("inventory").setDescription("Envanterini görüntüle"));