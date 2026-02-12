import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = {
    name: "sustur",
    description: "Kullanıcıyı belirli bir süre susturur.",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Üyeleri Sustur` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const user = interaction.options.getMember('kullanici');
            const sure = interaction.options.getInteger('dakika');
            const sebep = interaction.options.getString('sebep') || "Belirtilmedi";

            if (!user) {
                return interaction.reply({ content: "❌ Geçerli bir kullanıcı belirtmelisin!", ephemeral: true });
            }

            if (!user.moderatable) {
                return interaction.reply({ content: "❌ Bu kullanıcıyı susturmaya yetkim yetmiyor!", ephemeral: true });
            }

            await user.timeout(sure * 60 * 1000, sebep);
            
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("✅ Kullanıcı Susturuldu")
                .setDescription(`**${user.user.tag}**, ${sure} dakika boyunca susturuldu.`)
                .addFields(
                    { name: "Sebep", value: sebep, inline: true },
                    { name: "Süre", value: `${sure} dakika`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Sustur komutu hatası:", error);
            return interaction.reply({ content: "❌ Kullanıcı susturulurken bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("sustur")
    .setDescription("Kullanıcıyı belirli bir süre susturur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName("kullanici").setDescription("Susturulacak kişi").setRequired(true))
    .addIntegerOption(opt => opt.setName("dakika").setDescription("Kaç dakika?").setRequired(true))
    .addStringOption(opt => opt.setName("sebep").setDescription("Neden?").setRequired(false));