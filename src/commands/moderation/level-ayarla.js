import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "level-ayarla",
    description: "Seviye atlama bildirimlerini ayarlar.",
    
    async execute(interaction) {
        try {
            const kanal = interaction.options.getChannel('kanal');
            let mesaj = interaction.options.getString('mesaj');
            const guildId = interaction.guild.id;

            if (!kanal.isTextBased()) {
                return interaction.reply({ 
                    content: "❌ Sadece yazı kanallarını seçebilirsin!",
                    ephemeral: true 
                });
            }

            // "özel" seçeneği gelirse varsayılan mesaj ata
            if (mesaj === "özel") {
                mesaj = "🎉 {user} Level {level}'a ulaştı!";
            }

            if (!mesaj.includes('{user}') || !mesaj.includes('{level}')) {
                return interaction.reply({ 
                    content: "❌ Mesaj en az `{user}` ve `{level}` etiketlerini içermeli!",
                    ephemeral: true 
                });
            }

            db.set(`level_ayar_${guildId}`, {
                kanalId: kanal.id,
                mesaj: mesaj,
                ayarlayan: interaction.user.id,
                ayarTarihi: Date.now()
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ Level Sistemi Ayarları")
                .setDescription("Level sistemi başarıyla ayarlandı!")
                .addFields(
                    { name: "📌 Kanal", value: `<#${kanal.id}>`, inline: true },
                    { name: "🎯 Mesaj Tipi", value: "Level Atlama", inline: true },
                    { name: "📝 Örnek Mesaj", value: mesaj
                        .replace(/{user}/g, interaction.user.toString())
                        .replace(/{level}/g, "10")
                        .replace(/{guild}/g, interaction.guild.name)
                        .replace(/{type}/g, "Mesaj")
                    }
                )
                .setFooter({ text: `${interaction.guild.name} • Level Sistemi`, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error("❌ Level-ayarla komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("level-ayarla")
    .setDescription("Level up mesajını ve kanalını ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt => 
        opt.setName("kanal")
            .setDescription("Level up mesajlarının gideceği kanal")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
    .addStringOption(opt => 
        opt.setName("mesaj")
            .setDescription("Kullanılabilir: {user} {level} {guild} {type}")
            .setRequired(true)
            .addChoices(
                { name: "Standart", value: "🎉 {user} Level {level}'a ulaştı!" },
                { name: "Tebrik", value: "🏆 Tebrikler {user}! Level {level}'a yükseldin!" },
                { name: "Güç", value: "⚡ {user} gücü arttı! Artık Level {level}!" },
                { name: "Özel (elle yaz)", value: "özel" }
            ));