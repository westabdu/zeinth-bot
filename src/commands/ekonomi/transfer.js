import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "transfer",
    description: "Başka bir kullanıcıya ZenCoin gönderir (komisyon: %5).",
    async execute(interaction) {
        try {
            const miktar = interaction.options.getInteger('miktar');
            const hedef = interaction.options.getUser('kullanıcı');
            const gonderenId = interaction.user.id;
            const guildId = interaction.guild.id;

            if (hedef.id === gonderenId) return interaction.reply({ content: "❌ Kendine para gönderemezsin!", ephemeral: true });
            if (hedef.bot) return interaction.reply({ content: "❌ Botlara para gönderemezsin!", ephemeral: true });
            if (miktar < 1) return interaction.reply({ content: "❌ En az 1 ZenCoin gönderebilirsin!", ephemeral: true });

            const gonderenKey = `stats_${guildId}_${gonderenId}`;
            const hedefKey = `stats_${guildId}_${hedef.id}`;

            let gonderenData = db.get(gonderenKey);
            let hedefData = db.get(hedefKey);

            if (!gonderenData) {
                gonderenData = { cash: 0, bank: 0, total_transfers: 0, quests: { daily: {} } };
                db.set(gonderenKey, gonderenData);
            }
            if (!hedefData) {
                hedefData = { cash: 0, bank: 0 };
                db.set(hedefKey, hedefData);
            }

            if ((gonderenData.cash || 0) < miktar) {
                return interaction.reply({
                    content: `❌ Yetersiz nakit! Mevcut: **${(gonderenData.cash || 0).toLocaleString()} ZenCoin**`,
                    ephemeral: true
                });
            }

            let komisyonOrani = 0.05;
            if (gonderenData.perks?.some(p => p.type === "tax_free_transfer" && !p.used)) {
                komisyonOrani = 0;
                const perk = gonderenData.perks.find(p => p.type === "tax_free_transfer" && !p.used);
                perk.used = true;
            }

            const komisyon = Math.floor(miktar * komisyonOrani);
            const netMiktar = miktar - komisyon;

            gonderenData.cash = (gonderenData.cash || 0) - miktar;
            hedefData.cash = (hedefData.cash || 0) + netMiktar;

            gonderenData.total_spent = (gonderenData.total_spent || 0) + miktar;
            hedefData.total_earned = (hedefData.total_earned || 0) + netMiktar;
            gonderenData.total_transfers = (gonderenData.total_transfers || 0) + 1;

            if (gonderenData.quests?.daily) {
                Object.values(gonderenData.quests.daily).forEach(quest => {
                    if (quest.id === "transfer" && !quest.completed) {
                        quest.progress = (quest.progress || 0) + 1;
                        if (quest.progress >= quest.target) quest.completed = true;
                    }
                });
            }

            db.set(gonderenKey, gonderenData);
            db.set(hedefKey, hedefData);

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle("💸 Transfer Başarılı!")
                .setDescription(`${interaction.user} → ${hedef}`)
                .addFields(
                    { name: "💰 Gönderilen", value: `**${miktar.toLocaleString()} ZenCoin**`, inline: true },
                    { name: "🧾 Komisyon", value: `**${komisyon.toLocaleString()} ZenCoin** (%${komisyonOrani * 100})`, inline: true },
                    { name: "✅ Alıcıya Ulaşan", value: `**${netMiktar.toLocaleString()} ZenCoin**`, inline: true },
                    { name: "💵 Yeni Bakiyen", value: `**${(gonderenData.cash || 0).toLocaleString()} ZenCoin**`, inline: false }
                )
                .setFooter({ text: "Zenith Ekonomi Sistemi" })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Transfer komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Birine para transfer edersiniz (komisyon %5).")
    .addUserOption(opt => opt.setName("kullanıcı").setDescription("Para göndermek istediğin kişi").setRequired(true))
    .addIntegerOption(opt => opt.setName("miktar").setDescription("Gönderilecek miktar").setRequired(true));