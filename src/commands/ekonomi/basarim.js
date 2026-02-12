import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const ACHIEVEMENTS = {
    message_100: { name: "💬 Konuşkan", desc: "100 mesaj gönder", reward: 500, condition: (data) => (data.total_messages || 0) >= 100 },
    message_1000: { name: "💬 Efsane", desc: "1000 mesaj gönder", reward: 5000, condition: (data) => (data.total_messages || 0) >= 1000 },
    voice_100: { name: "🎧 Sese Düşkün", desc: "100 dakika seste kal", reward: 500, condition: (data) => (data.total_voice || 0) >= 100 },
    gamble_10: { name: "🎲 Kumarbaz", desc: "10 kumar oyna", reward: 1000, condition: (data) => (data.total_gambles || 0) >= 10 },
    transfer_5: { name: "💸 Hayırsever", desc: "5 başarılı transfer yap", reward: 1000, condition: (data) => (data.total_transfers || 0) >= 5 },
    market_5: { name: "🛍️ Alışverişkolik", desc: "5 market alışverişi yap", reward: 2000, condition: (data) => (data.total_purchases || 0) >= 5 },
    job_10: { name: "💼 Kariyerist", desc: "İş seviyesi 10 ol", reward: 5000, condition: (data) => (data.job_level || 1) >= 10 },
    pet_owner: { name: "🦊 Hayvansever", desc: "Evcil hayvan sahiplen", reward: 1000, condition: (data) => data.pet != null },
    millionaire: { name: "👑 Milyoner", desc: "Toplam 1.000.000 ZenCoin biriktir", reward: 50000, condition: (data) => ((data.cash || 0) + (data.bank || 0)) >= 1000000 }
};

export const data = {
    name: "başarım",
    description: "Başarımlarını görüntüle ve ödülleri topla!",
    async execute(interaction) {
        try {
            const guildId = interaction.guild.id;
            const userId = interaction.user.id;
            const userKey = `stats_${guildId}_${userId}`;
            let userData = db.get(userKey) || { achievements: [] };
            if (!userData.achievements) userData.achievements = [];

            const sub = interaction.options.getSubcommand();

            if (sub === "list") {
                const embed = new EmbedBuilder().setColor(0xFFD700).setTitle(`🏆 ${interaction.user.username} Başarımları`)
                    .setDescription(userData.achievements.length ? userData.achievements.map(a => `✅ ${a}`).join('\n') : "Henüz başarım kazanmadın!").setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === "check") {
                let earned = [];
                for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
                    if (!userData.achievements.includes(id) && ach.condition(userData)) {
                        userData.achievements.push(id);
                        userData.cash = (userData.cash || 0) + ach.reward;
                        userData.total_earned = (userData.total_earned || 0) + ach.reward;
                        earned.push(`**${ach.name}** +${ach.reward} ZenCoin`);
                    }
                }
                if (earned.length > 0) {
                    db.set(userKey, userData);
                    const embed = new EmbedBuilder().setColor(0x00FF00).setTitle("🎉 Yeni Başarım Kazandın!").setDescription(earned.join('\n')).setTimestamp();
                    return interaction.reply({ embeds: [embed] });
                } else {
                    return interaction.reply({ content: "📭 Yeni başarım yok.", ephemeral: true });
                }
            }
        } catch (error) {
            console.error("❌ Başarım komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("başarım")
    .setDescription("Başarım sistemi")
    .addSubcommand(sub => sub.setName("list").setDescription("Kazandığın başarımları göster"))
    .addSubcommand(sub => sub.setName("check").setDescription("Yeni başarımları kontrol et ve ödülü al"));