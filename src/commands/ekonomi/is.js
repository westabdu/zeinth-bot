import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

const JOBS = {
    temizlikci: { name: "🧹 Temizlikçi", basePay: 50, xpPerWork: 10, levelReq: 1 },
    kasiyer: { name: "💳 Kasiyer", basePay: 80, xpPerWork: 15, levelReq: 3 },
    sofor: { name: "🚕 Şoför", basePay: 120, xpPerWork: 20, levelReq: 5 },
    itfaiyeci: { name: "🚒 İtfaiyeci", basePay: 180, xpPerWork: 25, levelReq: 10 },
    doktor: { name: "👨‍⚕️ Doktor", basePay: 250, xpPerWork: 30, levelReq: 15 },
    yazilimci: { name: "💻 Yazılımcı", basePay: 350, xpPerWork: 40, levelReq: 20 },
    pilot: { name: "✈️ Pilot", basePay: 500, xpPerWork: 50, levelReq: 30 },
    ceo: { name: "👑 CEO", basePay: 1000, xpPerWork: 100, levelReq: 50 }
};

export const data = {
    name: "iş",
    description: "İş bul, çalış, terfi et!",
    async execute(interaction) {
        try {
            const sub = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            const userId = interaction.user.id;
            const userKey = `stats_${guildId}_${userId}`;
            
            let userData = await db.get(userKey);
            if (!userData) userData = { cash: 0, msg_lv: 1, job: null, job_xp: 0, job_level: 1 };

            if (sub === "liste") {
                const embed = new EmbedBuilder().setColor(0x3498DB).setTitle("💼 Mevcut İşler").setTimestamp();
                let desc = "";
                for (const [id, job] of Object.entries(JOBS)) {
                    desc += `**${job.name}** \`${id}\`\n└ 💰 Saatlik: ${job.basePay} ZenCoin | 📊 Level: ${job.levelReq}\n`;
                }
                embed.setDescription(desc);
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === "başvur") {
                const jobId = interaction.options.getString("iş");
                const job = JOBS[jobId];
                if (!job) return interaction.reply({ content: "❌ Geçersiz iş!", ephemeral: true });
                if (userData.msg_lv < job.levelReq) return interaction.reply({ content: `🔒 Bu iş için **Level ${job.levelReq}** gerekiyor!`, ephemeral: true });
                if (userData.job) return interaction.reply({ content: "❌ Zaten bir işin var! Önce `/iş istifa` et.", ephemeral: true });

                userData.job = jobId;
                userData.job_xp = 0;
                userData.job_level = 1;
                await db.set(userKey, userData);
                return interaction.reply({ content: `✅ **${job.name}** olarak işe başladın! Çalışmak için: \`/iş çalış\`` });
            }

            if (sub === "çalış") {
                if (!userData.job) return interaction.reply({ content: "❌ Önce bir işe başvurmalısın! `/iş liste`", ephemeral: true });
                const job = JOBS[userData.job];
                const cooldown = 30 * 60 * 1000;
                if (Date.now() - (userData.last_work || 0) < cooldown) {
                    const kalan = cooldown - (Date.now() - userData.last_work);
                    const dakika = Math.ceil(kalan / 60000);
                    return interaction.reply({ content: `⏳ Tekrar çalışmak için **${dakika} dakika** bekle.`, ephemeral: true });
                }

                const multiplier = 0.8 + Math.random() * 0.4;
                const earned = Math.floor(job.basePay * userData.job_level * multiplier);
                const xpGain = job.xpPerWork + Math.floor(Math.random() * 10);

                userData.cash += earned;
                userData.total_earned = (userData.total_earned || 0) + earned;
                userData.job_xp += xpGain;
                userData.last_work = Date.now();

                let levelUp = false;
                while (userData.job_xp >= userData.job_level * 100) {
                    userData.job_xp -= userData.job_level * 100;
                    userData.job_level++;
                    levelUp = true;
                }

                await db.set(userKey, userData);

                const embed = new EmbedBuilder().setColor(0x2ECC71).setTitle("💼 Çalıştın!").setDescription(`${interaction.user} **${job.name}** olarak çalıştı.`)
                    .addFields({ name: "💰 Kazanç", value: `${earned.toLocaleString()} ZenCoin`, inline: true },
                               { name: "✨ İş XP", value: `+${xpGain}`, inline: true });
                if (levelUp) embed.addFields({ name: "🎉 TERFİ!", value: `**Seviye ${userData.job_level}** oldun!`, inline: false });
                embed.setFooter({ text: "30 dakika sonra tekrar çalışabilirsin." }).setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === "bilgi") {
                if (!userData.job) return interaction.reply({ content: "❌ Henüz bir işin yok. `/iş liste`", ephemeral: true });
                const job = JOBS[userData.job];
                const embed = new EmbedBuilder().setColor(0x3498DB).setTitle("📊 İş Bilgisi").setDescription(`**${job.name}**`)
                    .addFields({ name: "📈 Seviye", value: `${userData.job_level}`, inline: true },
                               { name: "✨ İş XP", value: `${userData.job_xp || 0} / ${userData.job_level * 100}`, inline: true },
                               { name: "💰 Saatlik", value: `~${Math.floor(job.basePay * userData.job_level)} ZenCoin`, inline: true })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === "istifa") {
                if (!userData.job) return interaction.reply({ content: "❌ Zaten bir işin yok!", ephemeral: true });
                userData.job = null; userData.job_xp = 0; userData.job_level = 1;
                await db.set(userKey, userData);
                return interaction.reply({ content: "✅ İşinden istifa ettin. Yeni bir iş arayabilirsin!" });
            }
        } catch (error) {
            console.error("❌ İş komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("iş")
    .setDescription("İş sistemi")
    .addSubcommand(sub => sub.setName("liste").setDescription("Mevcut işleri listele"))
    .addSubcommand(sub => sub.setName("bilgi").setDescription("İş bilgini göster"))
    .addSubcommand(sub => sub.setName("istifa").setDescription("İşinden ayrıl"))
    .addSubcommand(sub => sub.setName("çalış").setDescription("Çalış ve para kazan"))
    .addSubcommand(sub => sub
        .setName("başvur")
        .setDescription("Bir işe başvur")
        .addStringOption(opt => opt.setName("iş").setDescription("İş ID'si").setRequired(true)
            .addChoices(...Object.entries(JOBS).map(([id, job]) => ({ name: job.name, value: id })))));