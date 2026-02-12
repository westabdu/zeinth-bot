import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "avatar",
    description: "Bir kullanıcının avatarını büyük boyutta gösterir.",
    
    execute(interaction) {
        try {
            const user = interaction.options.getUser('kullanici') || interaction.user;
            const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`${user.username} Avatarı`)
                .setImage(avatarURL)
                .setFooter({ text: `İsteyen: ${interaction.user.tag}` });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Avatar komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName(data.name)
    .setDescription(data.description)
    .addUserOption(option => 
        option.setName('kullanici')
            .setDescription('Avatarını görmek istediğiniz kullanıcıyı seçin.')
            .setRequired(false));