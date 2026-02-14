// commands/bilgi.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const data = {
    name: "bilgi",
    description: "Bir kullanıcı hakkında detaylı bilgi verir.",
    
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('kullanici') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id);
            const presence = member.presence || { status: 'offline', activities: [] };

            // Durum emojisi
            const durumEmoji = {
                online: '🟢',
                idle: '🌙',
                dnd: '⛔',
                offline: '⚫'
            }[presence.status] || '⚫';

            // Aktiviteler
            const aktiviteler = presence.activities.map(a => {
                let txt = `**${a.type}**: ${a.name}`;
                if (a.details) txt += `\n└ ${a.details}`;
                if (a.state) txt += `\n└ ${a.state}`;
                return txt;
            }).join('\n') || 'Yok';

            // Cihaz bilgisi (varsa)
            let cihaz = 'Bilinmiyor';
            if (presence.clientStatus) {
                const cihazlar = [];
                if (presence.clientStatus.desktop) cihazlar.push('💻 Masaüstü');
                if (presence.clientStatus.mobile) cihazlar.push('📱 Mobil');
                if (presence.clientStatus.web) cihazlar.push('🌐 Web');
                cihaz = cihazlar.join(', ');
            }

            // Roller (ilk 10 tanesi)
            const roller = member.roles.cache
                .filter(r => r.id !== interaction.guild.id) // @everyone'ı çıkar
                .sort((a, b) => b.position - a.position)
                .map(r => r.toString())
                .slice(0, 10)
                .join(' ') || 'Rol yok';

            // Boost durumu
            const boost = member.premiumSince ? `✅ (${Math.floor((Date.now() - member.premiumSince) / (1000 * 60 * 60 * 24))} gündür)` : '❌ Yok';

            const embed = new EmbedBuilder()
                .setColor(member.displayHexColor || 0x5865F2)
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setDescription(`${durumEmoji} **${presence.status === 'online' ? 'Çevrimiçi' : presence.status === 'idle' ? 'Boşta' : presence.status === 'dnd' ? 'Rahatsız Etme' : 'Çevrimdışı'}**`)
                .addFields(
                    { name: '🆔 Kullanıcı ID', value: user.id, inline: true },
                    { name: '🤖 Bot mu?', value: user.bot ? 'Evet' : 'Hayır', inline: true },
                    { name: '📅 Hesap Oluşturulma', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '📥 Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: '🎭 En Üst Rol', value: member.roles.highest.toString(), inline: true },
                    { name: '💪 Boost Durumu', value: boost, inline: true },
                    { name: '📱 Cihaz', value: cihaz, inline: true },
                    { name: '🎮 Aktivite', value: aktiviteler, inline: false },
                    { name: '🎨 Roller', value: roller.length > 800 ? roller.slice(0, 800) + '...' : roller, inline: false }
                )
                .setFooter({ text: `Sorgulayan: ${interaction.user.tag}` })
                .setTimestamp();

            // Avatar butonu
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Avatarı İndir')
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.displayAvatarURL({ size: 4096, extension: 'png' }))
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error("❌ Bilgi komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("bilgi")
    .setDescription("Bir kullanıcı hakkında detaylı bilgi verir.")
    .addUserOption(option => 
        option.setName('kullanici')
            .setDescription('Bilgisine bakılacak kullanıcıyı seçin.')
            .setRequired(false));