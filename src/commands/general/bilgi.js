import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "bilgi",
    description: "Bir kullanıcı hakkında detaylı bilgi verir.",
    
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('kullanici') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id);

            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .addFields(
                    { name: '🆔 Kullanıcı ID', value: user.id, inline: true },
                    { name: '📅 Katılım Tarihi', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: '🚀 Hesabın Açılışı', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '🎭 En Üst Rol', value: `${member.roles.highest}`, inline: true }
                )
                .setFooter({ text: `Sorgulayan: ${interaction.user.tag}` });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("❌ Bilgi komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName(data.name)
    .setDescription(data.description)
    .addUserOption(option => 
        option.setName('kullanici')
            .setDescription('Bilgisine bakılacak kullanıcıyı seçin.')
            .setRequired(false));