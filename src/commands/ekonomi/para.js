import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "para",
    description: "Cüzdanınızdaki ve bankanızdaki parayı gösterir.",
    async execute(interaction) {
        try {
            const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
            const guildId = interaction.guild.id;
            const userKey = `stats_${guildId}_${hedef.id}`;
            
            // 🔁 Asenkron get
            let userData = await db.get(userKey);
            if (!userData) userData = { cash: 0, bank: 0 };

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setAuthor({ name: hedef.tag, iconURL: hedef.displayAvatarURL() })
                .setTitle("💰 Cüzdan ve Banka Bilgisi")
                .setDescription(
                    `${hedef.id === interaction.user.id ? "Senin" : `**${hedef.username}** kullanıcısının`} toplam varlığı: **${((userData.cash || 0) + (userData.bank || 0)).toLocaleString()} ZenCoin**`
                )
                .addFields(
                    { name: "💵 Nakit", value: `${(userData.cash || 0).toLocaleString()} ZenCoin`, inline: true },
                    { name: "🏦 Banka", value: `${(userData.bank || 0).toLocaleString()} ZenCoin`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Para komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("para")
    .setDescription("Bakiyenizi kontrol edersiniz.")
    .addUserOption(opt => opt.setName("kullanıcı").setDescription("Parasını görmek istediğin kişi"));