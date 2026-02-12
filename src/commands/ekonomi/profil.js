import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "profil",
    description: "Kapsamlı kullanıcı profilini gösterir.",
    async execute(interaction) {
        try {
            const hedef = interaction.options.getUser("kullanıcı") || interaction.user;
            const guildId = interaction.guild.id;
            const userKey = `stats_${guildId}_${hedef.id}`;
            let data = db.get(userKey) || {};

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setAuthor({ name: hedef.tag, iconURL: hedef.displayAvatarURL() })
                .setTitle("👤 Kullanıcı Profili")
                .addFields(
                    { name: "📊 Level", value: `Mesaj: ${data.msg_lv || 1}\nSes: ${data.voice_lv || 1}`, inline: true },
                    { name: "💰 Ekonomi", value: `Nakit: ${(data.cash || 0).toLocaleString()}\nBanka: ${(data.bank || 0).toLocaleString()}`, inline: true },
                    { name: "💼 İş", value: data.job ? `${data.job} (Lv.${data.job_level || 1})` : "İşsiz", inline: true }
                )
                .setTimestamp();

            if (data.pet) {
                const petNames = { kedi: "🐱 Kedi", kopek: "🐶 Köpek", tavsan: "🐰 Tavşan", tilki: "🦊 Tilki" };
                embed.addFields({ name: "🦊 Evcil Hayvan", value: `${petNames[data.pet] || data.pet} (Mutluluk: %${data.petHappiness || 50})`, inline: true });
            }

            const achievements = data.achievements || [];
            embed.addFields({ name: "🏆 Başarımlar", value: achievements.length > 0 ? achievements.slice(0, 3).join(", ") + (achievements.length > 3 ? ` +${achievements.length - 3}` : "") : "Hiç yok", inline: false });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Profil komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("profil")
    .setDescription("Kullanıcı profilini gösterir")
    .addUserOption(opt => opt.setName("kullanıcı").setDescription("Profili görüntülenecek kişi"));