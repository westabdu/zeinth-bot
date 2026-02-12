import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

// 📊 GÜNCEL KOMUT SAYILARI (helpHandler.js ile SENKRON)
const KOMUT_SAYILARI = {
    moderasyon: 15,
    genel: 8,
    eğlence: 5,
    ekonomi: 33,
    seviye: 3,
    bot: 2,
    toplam: 66 // 15+8+5+33+3+2 = 66
};

export const data = {
    name: "yardim",
    description: "🤖 Botun tüm komutlarını kategorize edilmiş şekilde listeler.",
    
    async execute(interaction) {
        // 🎨 ANA MENÜ EMBED
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("🤖 Zeinth Moderation - Yardım Menüsü")
            .setDescription(
                "✨ **Zeinth Moderation**'a hoş geldin!\n" +
                "Aşağıdaki menüden bir kategori seçerek tüm komutları görüntüleyebilirsin.\n\n" +
                `📚 **Toplam Komut:** ${KOMUT_SAYILARI.toplam}\n` +
                `💰 **Ekonomi:** ${KOMUT_SAYILARI.ekonomi} komut (Dev sistem!)\n` +
                `🛡️ **Moderasyon:** ${KOMUT_SAYILARI.moderasyon} | ⚙️ **Genel:** ${KOMUT_SAYILARI.genel} | 🎮 **Eğlence:** ${KOMUT_SAYILARI.eğlence} | 📊 **Seviye:** ${KOMUT_SAYILARI.seviye} | 🤖 **Bot:** ${KOMUT_SAYILARI.bot}`
            )
            .addFields(
                { 
                    name: "🛡️ Moderasyon", 
                    value: `Sunucu yönetim komutları • **${KOMUT_SAYILARI.moderasyon} komut**\n\`/ban\`, \`/sustur\`, \`/rol-panel\`, \`/çekiliş\`...`, 
                    inline: true 
                },
                { 
                    name: "⚙️ Genel", 
                    value: `Kullanıcı komutları • **${KOMUT_SAYILARI.genel} komut**\n\`/avatar\`, \`/profil\`, \`/anket\`, \`/afk\`...`, 
                    inline: true 
                },
                { 
                    name: "🎮 Eğlence", 
                    value: `Eğlence ve oyunlar • **${KOMUT_SAYILARI.eğlence} komut**\n\`/zeinth\`, \`/kelime-oyun\`, \`/çekiliş\`...`, 
                    inline: true 
                },
                { 
                    name: "💰 EKONOMİ", 
                    value: `⭐ **DEV EKONOMİ SİSTEMİ** ⭐\n**${KOMUT_SAYILARI.ekonomi} komut** - İş, hisse, pet, loto, market...`, 
                    inline: true 
                },
                { 
                    name: "📊 Seviye", 
                    value: `Level ve XP sistemi • **${KOMUT_SAYILARI.seviye} komut**\n\`/level\`, \`/level-top\`, \`/level-ayarla\``, 
                    inline: true 
                },
                { 
                    name: "🤖 Bot", 
                    value: `Bot yönetimi • **${KOMUT_SAYILARI.bot} komut**\n\`/resim\`, \`/sohbet\``, 
                    inline: true 
                }
            )
            .addFields({
                name: "📌 Not",
                value: "Kategorilerden birini seçtiğinde **detaylı komut listesini** görebilirsin.",
                inline: false
            })
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({ 
                text: `Zeinth Moderation • ${KOMUT_SAYILARI.toplam} komut • v1.0.0`, 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        // 📋 SELECT MENU - customId events ile aynı olmalı!
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('yardim_menu') // ✅ help_menu -> yardim_menu (events ile uyumlu)
            .setPlaceholder('📋 Bir kategori seçin...')
            .addOptions([
                { 
                    label: '🛡️ Moderasyon', 
                    description: `${KOMUT_SAYILARI.moderasyon} komut - Ban, sustur, rol-panel...`, 
                    value: 'moderasyon', 
                    emoji: '🛡️' 
                },
                { 
                    label: '⚙️ Genel', 
                    description: `${KOMUT_SAYILARI.genel} komut - Avatar, profil, anket...`, 
                    value: 'genel', 
                    emoji: '⚙️' 
                },
                { 
                    label: '🎮 Eğlence', 
                    description: `${KOMUT_SAYILARI.eğlence} komut - Zeinth, çekiliş, kelime...`, 
                    value: 'eğlence', 
                    emoji: '🎮' 
                },
                { 
                    label: '💰 EKONOMİ', 
                    description: `⭐ ${KOMUT_SAYILARI.ekonomi} komut - DEV SİSTEM! ⭐`, 
                    value: 'ekonomi', 
                    emoji: '💰' 
                },
                { 
                    label: '📊 Seviye', 
                    description: `${KOMUT_SAYILARI.seviye} komut - Level, XP, sıralama...`, 
                    value: 'seviye', 
                    emoji: '📊' 
                },
                { 
                    label: '🤖 Bot', 
                    description: `${KOMUT_SAYILARI.bot} komut - Resim, sohbet...`, 
                    value: 'bot', 
                    emoji: '🤖' 
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Butonlu versiyon istersen - İLERİ SEVİYE
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🌐 Discord')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/zenith') // Kendi discord sunucunun linkini yaz
                .setEmoji('🔗'),
            new ButtonBuilder()
                .setLabel('📰 Website')
                .setStyle(ButtonStyle.Link)
                .setURL('https://zenithbot.com') // Varsa website
                .setEmoji('🌍')
                .setDisabled(true) // Yoksa disabled
        );

        // Eğer website yoksa sadece select menu gönder
        await interaction.reply({ 
            embeds: [embed], 
            components: [row], // buttonRow eklemek istersen [row, buttonRow]
            ephemeral: false 
        });

        console.log(`📋 Yardım menüsü açıldı: ${interaction.user.tag}`);
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("yardim")
    .setDescription("🤖 Botun tüm komutlarını kategorize edilmiş şekilde listeler.");