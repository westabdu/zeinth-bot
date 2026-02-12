import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = {
    name: "ban",
    description: "Kullanıcıyı sunucudan yasaklar.",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const target = interaction.options.getMember('kullanici');
            const reason = interaction.options.getString('sebep') || "Sebep belirtilmedi.";

            if (!target) {
                return interaction.reply({ content: "❌ Geçerli bir kullanıcı belirtmelisin!", ephemeral: true });
            }

            if (target.id === interaction.user.id) {
                return interaction.reply({ content: "❌ Kendini banlayamazsın!", ephemeral: true });
            }

            if (!target.bannable) {
                return interaction.reply({ content: "❌ Bu kullanıcıyı yasaklamak için yetkim yetmiyor. (Rolü benden üstte olabilir)", ephemeral: true });
            }

            await target.ban({ reason });
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Kullanıcı Yasaklandı")
                .setDescription(`**${target.user.tag}** başarıyla yasaklandı!`)
                .addFields(
                    { name: "Sebep", value: reason, inline: true },
                    { name: "Yetkili", value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Ban komutu hatası:", error);
            return interaction.reply({ content: "❌ Kullanıcı yasaklanırken bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Kullanıcıyı sunucudan yasaklar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option => 
        option.setName('kullanici')
            .setDescription('Yasaklanacak kullanıcıyı seçin.')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('sebep')
            .setDescription('Yasaklama sebebini girin.')
            .setRequired(false));