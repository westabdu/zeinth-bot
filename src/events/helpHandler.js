import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";

// 📚 KOMPLE KOMUT VERİTABANI - GÜNCEL!
const commandDatabase = {
    moderasyon: {
        title: "🛡️ Moderasyon Komutları",
        description: "Sunucu yönetimi için gerekli komutlar",
        color: 0xE74C3C,
        commands: [
            { name: "/ban", description: "Kullanıcıyı sunucudan yasaklar", usage: "/ban [@kullanıcı] [sebep]" },
            { name: "/sustur", description: "Kullanıcıyı belirli süre susturur", usage: "/sustur [@kullanıcı] [süre] [sebep]" },
            { name: "/uyar", description: "Kullanıcıyı uyarır ve kayıt eder", usage: "/uyar [@kullanıcı] [sebep]" },
            { name: "/sil", description: "Belirtilen sayıda mesajı siler", usage: "/sil [miktar]" },
            { name: "/nuke", description: "Kanalı temizleyip yeniden oluşturur", usage: "/nuke" },
            { name: "/kanal-aç-kapat", description: "Kanalı yazıma kapatır/açar", usage: "/kanal-aç-kapat" },
            { name: "/log-ayarla", description: "Log kanalını ayarlar", usage: "/log-ayarla [kanal]" },
            { name: "/hg-ayarla", description: "Hoş geldin kanalını ayarlar", usage: "/hg-ayarla [kanal]" },
            { name: "/otorol-ayarla", description: "Otorol sistemini ayarlar", usage: "/otorol-ayarla [rol]" },
            { name: "/kurallar-kur", description: "Kurallar kanalını ayarlar", usage: "/kurallar-kur [kanal]" },
            { name: "/ticket-kur", description: "Ticket sistemini kurar", usage: "/ticket-kur" },
            { name: "/rol-panel", description: "Emoji ile rol alma paneli kurar", usage: "/rol-panel kur [emojiler] [roller]" },
            { name: "/rol-panel sil", description: "Rol panelini siler", usage: "/rol-panel sil [mesaj_id]" },
            { name: "/rol-panel listele", description: "Aktif panelleri listeler", usage: "/rol-panel listele" },
            { name: "/rol-panel log-ayarla", description: "Rol log kanalını ayarlar", usage: "/rol-panel log-ayarla [kanal]" },
            { name: "/rol-sıfırla", description: "Tüm rol panellerini sıfırlar", usage: "/rol-sıfırla" }
        ]
    },
    
    genel: {
        title: "⚙️ Genel Komutlar",
        description: "Genel kullanım komutları",
        color: 0x3498DB,
        commands: [
            { name: "/yardim", description: "Bu yardım menüsünü gösterir", usage: "/yardim" },
            { name: "/bilgi", description: "Bot hakkında bilgi verir", usage: "/bilgi" },
            { name: "/istatistik", description: "Bot istatistiklerini gösterir", usage: "/istatistik" },
            { name: "/avatar", description: "Kullanıcının avatarını gösterir", usage: "/avatar [@kullanıcı]" },
            { name: "/anket", description: "Anket başlatır", usage: "/anket [soru]" },
            { name: "/afk", description: "AFK moduna geçersiniz", usage: "/afk [sebep]" },
            { name: "/ping", description: "Botun ping değerini gösterir", usage: "/ping" },
            { name: "/profil", description: "Kapsamlı kullanıcı profilini gösterir", usage: "/profil [@kullanıcı]" }
        ]
    },
    
    eğlence: {
        title: "🎮 Eğlence Komutları",
        description: "Eğlence ve oyun komutları",
        color: 0x9B59B6,
        commands: [
            { name: "/zeinth", description: "Zeinth ile sohbet edersiniz", usage: "/zeinth [mesaj]" },
            { name: "/kelime-oyun-ayarla", description: "Kelime oyununu ayarlar", usage: "/kelime-oyun-ayarla [kanal]" },
            { name: "/resim", description: "AI ile resim oluşturur", usage: "/resim [açıklama]" },
            { name: "/çekiliş", description: "Yeni bir çekiliş başlatır", usage: "/çekiliş [ödül] [kazanan] [süre]" },
            { name: "/çekiliş-yönet", description: "Çekilişleri yönetir", usage: "/çekiliş-yönet [listele/bitir/yeniden-çek]" }
        ]
    },
    
    ekonomi: {
        title: "💰 EKONOMİ SİSTEMİ - 20+ KOMUT",
        description: "Zenith'in devasa ekonomi sistemi! Para kazan, yatırım yap, zengin ol!",
        color: 0xF1C40F,
        commands: [
            // 💵 TEMEL EKONOMİ (4)
            { name: "/para", description: "Cüzdanınızdaki ve bankanızdaki parayı gösterir", usage: "/para [@kullanıcı]" },
            { name: "/transfer", description: "Başka kullanıcıya para gönderir (%5 komisyon)", usage: "/transfer [@kullanıcı] [miktar]" },
            { name: "/günlük", description: "Günlük ödülünü al! Streak ile daha fazla kazan!", usage: "/günlük" },
            { name: "/çark", description: "Şans çarkını çevir ve ödül kazan! (Günde 1 kere)", usage: "/çark" },
            
            // 🏦 BANKA SİSTEMİ (4)
            { name: "/banka yatır", description: "Bankaya para yatır", usage: "/banka yatır [miktar]" },
            { name: "/banka çek", description: "Bankadan para çek", usage: "/banka çek [miktar]" },
            { name: "/banka faiz", description: "Günlük faizini al (%0.5)", usage: "/banka faiz" },
            { name: "/banka bilgi", description: "Banka bilgilerini görüntüle", usage: "/banka bilgi" },
            
            // 🎲 KUMAR SİSTEMİ (1)
            { name: "/kumar", description: "Şans oyunları oyna! (yazitura, zar, slots, jackpot)", usage: "/kumar [miktar] [oyun]" },
            
            // 📈 HİSSE/PİYASA (4)
            { name: "/hisse piyasa", description: "Güncel hisse fiyatlarını göster", usage: "/hisse piyasa" },
            { name: "/hisse al", description: "Hisse senedi satın al", usage: "/hisse al [sembol] [miktar]" },
            { name: "/hisse sat", description: "Hisse senedi sat", usage: "/hisse sat [sembol] [miktar]" },
            { name: "/hisse portföy", description: "Portföyünü göster", usage: "/hisse portföy" },
            
            // 💼 İŞ SİSTEMİ (5)
            { name: "/iş liste", description: "Mevcut işleri listele", usage: "/iş liste" },
            { name: "/iş başvur", description: "Bir işe başvur", usage: "/iş başvur [iş]" },
            { name: "/iş çalış", description: "Çalış ve para kazan (30 dk cooldown)", usage: "/iş çalış" },
            { name: "/iş bilgi", description: "İş bilgini göster", usage: "/iş bilgi" },
            { name: "/iş istifa", description: "İşinden ayrıl", usage: "/iş istifa" },
            
            // 🎫 LOTO SİSTEMİ (2)
            { name: "/loto katıl", description: "Loto bileti al (100 ZenCoin)", usage: "/loto katıl [adet]" },
            { name: "/loto bilgi", description: "Loto havuzunu göster", usage: "/loto bilgi" },
            
            // 🦊 EVcil HAYVAN (5)
            { name: "/pet liste", description: "Sahiplenebilecek hayvanları göster", usage: "/pet liste" },
            { name: "/pet sahiplen", description: "Evcil hayvan sahiplen", usage: "/pet sahiplen [hayvan]" },
            { name: "/pet besle", description: "Evcil hayvanını besle (50 ZenCoin)", usage: "/pet besle" },
            { name: "/pet bilgi", description: "Evcil hayvan bilgisini göster", usage: "/pet bilgi" },
            { name: "/pet topla", description: "Evcil hayvanının getirdiği parayı topla", usage: "/pet topla" },
            
            // 🏆 BAŞARIM & GÖREV (2)
            { name: "/başarım list", description: "Kazandığın başarımları göster", usage: "/başarım list" },
            { name: "/başarım check", description: "Yeni başarımları kontrol et ve ödül al", usage: "/başarım check" },
            { name: "/görev-tamamla", description: "Günlük görevlerini tamamla ve ödül al", usage: "/görev-tamamla" },
            
            // 🛒 MARKET & ENVANTER (3)
            { name: "/market list", description: "Market ürünlerini listele", usage: "/market list" },
            { name: "/market buy", description: "Ürün satın al", usage: "/market buy [id]" },
            { name: "/market inventory", description: "Envanterini görüntüle", usage: "/market inventory" },
            { name: "/kullan", description: "Envanterindeki bir eşyayı kullan", usage: "/kullan [eşya]" }
        ]
    },
    
    seviye: {
        title: "📊 Seviye Sistemi",
        description: "Level ve seviye sistemi - Mesaj ve ses XP'si kazan!",
        color: 0x2ECC71,
        commands: [
            { name: "/level", description: "Seviyenizi ve sıranızı gösterir", usage: "/level [@kullanıcı]" },
            { name: "/level-top", description: "Sunucudaki level sıralamasını gösterir", usage: "/level-top [sayfa]" },
            { name: "/level-ayarla", description: "Level sistemini ayarlarsınız", usage: "/level-ayarla [kanal] [rol]" }
        ]
    },
    
    bot: {
        title: "🤖 Bot Komutları",
        description: "Bot yönetim komutları",
        color: 0x95A5A6,
        commands: [
            { name: "/resim", description: "Yapay zeka ile resim oluşturmanı sağlar", usage: "/resim [açıklama]" },
            { name: "/sohbet", description: "Zeinth ile sohbet etmeni sağlar", usage: "/sohbet [mesaj]" }
        ]
    }
};

// 📊 TOPLAM KOMUT SAYISINI HESAPLA
let totalCommands = 0;
Object.values(commandDatabase).forEach(category => {
    totalCommands += category.commands.length;
});

// Ana menü embed'i
function getMainMenuEmbed(client) {
    // Kategori bazlı komut sayıları
    const moderasyonCount = commandDatabase.moderasyon.commands.length;
    const genelCount = commandDatabase.genel.commands.length;
    const eglenceCount = commandDatabase.eğlence.commands.length;
    const ekonomiCount = commandDatabase.ekonomi.commands.length;
    const seviyeCount = commandDatabase.seviye.commands.length;
    const botCount = commandDatabase.bot.commands.length;

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🤖 Zeinth Moderation - Yardım Menüsü")
        .setDescription("Lütfen bilgi almak istediğiniz kategoriyi aşağıdan seçin.\n\n" +
                       `📚 **Toplam Komut Sayısı:** ${totalCommands}\n` +
                       `💰 **Ekonomi Komutları:** ${ekonomiCount} (En büyük sistem!)\n` +
                       `🛡️ **Moderasyon:** ${moderasyonCount} | ⚙️ **Genel:** ${genelCount} | 🎮 **Eğlence:** ${eglenceCount} | 📊 **Seviye:** ${seviyeCount} | 🤖 **Bot:** ${botCount}`)
        .addFields(
            { name: "🛡️ Moderasyon", value: `Sunucu yönetim komutları • ${moderasyonCount} komut`, inline: true },
            { name: "⚙️ Genel", value: `Kullanıcı komutları • ${genelCount} komut`, inline: true },
            { name: "🎮 Eğlence", value: `Eğlence ve oyunlar • ${eglenceCount} komut`, inline: true },
            { name: "💰 EKONOMİ", value: `⭐ **DEV EKONOMİ SİSTEMİ!** ⭐\n${ekonomiCount} komut - İş, hisse, pet, loto, çark, market...`, inline: true },
            { name: "📊 Seviye", value: `Level sistemi • ${seviyeCount} komut`, inline: true },
            { name: "🤖 Bot", value: `Bot yönetimi • ${botCount} komut`, inline: true }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: `Zeinth Moderation • /yardim | ${totalCommands} komut`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();
}

export default client => {
    client.on('interactionCreate', async interaction => {
        // 🚫 ÇAKIŞMAYI ÖNLE - SADECE YARDIM KOMUTUNDAN GELEN SELECT MENU İŞLE
        if (interaction.isStringSelectMenu() && interaction.customId === 'yardim_menu') { // ✅ customId değişti!
            const category = interaction.values[0];
            const categoryData = commandDatabase[category];
            
            if (!categoryData) return;
            
            // Komut listesini oluştur
            let commandsList = "";
            
            // Ekonomi kategorisi özel düzenleme
            if (category === 'ekonomi') {
                // Alt başlıklara böl - GÜNCEL INDEX'LER!
                const ekonomiGruplari = [
                    { baslik: "💵 TEMEL EKONOMİ", komutlar: categoryData.commands.slice(0, 4) },
                    { baslik: "🏦 BANKA SİSTEMİ", komutlar: categoryData.commands.slice(4, 8) },
                    { baslik: "🎲 KUMAR & ÇARK", komutlar: categoryData.commands.slice(8, 10) },
                    { baslik: "📈 HİSSE PİYASASI", komutlar: categoryData.commands.slice(10, 14) },
                    { baslik: "💼 İŞ SİSTEMİ", komutlar: categoryData.commands.slice(14, 19) },
                    { baslik: "🎫 LOTO SİSTEMİ", komutlar: categoryData.commands.slice(19, 21) },
                    { baslik: "🦊 EVcil HAYVAN", komutlar: categoryData.commands.slice(21, 26) },
                    { baslik: "🏆 BAŞARIM & GÖREV", komutlar: categoryData.commands.slice(26, 29) },
                    { baslik: "🛒 MARKET & ENVANTER", komutlar: categoryData.commands.slice(29, 33) }
                ];
                
                for (const grup of ekonomiGruplari) {
                    if (grup.komutlar.length === 0) continue;
                    commandsList += `**${grup.baslik}**\n`;
                    grup.komutlar.forEach(cmd => {
                        commandsList += `└ **${cmd.name}** - ${cmd.description}\n   ↳ \`${cmd.usage || cmd.name}\`\n`;
                    });
                    commandsList += `\n`;
                }
            } else {
                // Diğer kategoriler normal listeleme
                categoryData.commands.forEach(cmd => {
                    commandsList += `**${cmd.name}**\n└ ${cmd.description}\n   ↳ \`${cmd.usage || cmd.name}\`\n\n`;
                });
            }
            
            // Embed çok uzunsa kes (Discord limiti 4096 karakter)
            if (commandsList.length > 3500) {
                commandsList = commandsList.substring(0, 3500) + "...\n*(Çok fazla komut var, hepsi gösterilemiyor)*";
            }
            
            const embed = new EmbedBuilder()
                .setColor(categoryData.color)
                .setTitle(categoryData.title)
                .setDescription(`${categoryData.description}\n\n${commandsList}`)
                .setFooter({ text: `📌 Kategori: ${category} • ${categoryData.commands.length} komut • Geri dönmek için butonu kullanın` })
                .setTimestamp();
            
            // Butonları oluştur
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('yardim_back') // ✅ customId değişti!
                    .setLabel('◀️ Ana Menü')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠'),
                new ButtonBuilder()
                    .setCustomId('yardim_close') // ✅ customId değişti!
                    .setLabel('❌ Kapat')
                    .setStyle(ButtonStyle.Danger)
            );
            
            await interaction.update({ embeds: [embed], components: [buttons] });
        }
        
        // 🔘 BUTONLAR İÇİN
        if (interaction.isButton()) {
            if (interaction.customId === 'yardim_back') { // ✅ customId değişti!
                // Ana menüye geri dön
                const mainMenuEmbed = getMainMenuEmbed(client);
                
                // Select Menu'yu tekrar oluştur
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('yardim_menu') // ✅ customId değişti!
                    .setPlaceholder('📋 Bir kategori seçin...')
                    .addOptions([
                        { label: '🛡️ Moderasyon', description: `${commandDatabase.moderasyon.commands.length} komut - Ban, sustur, rol-panel...`, value: 'moderasyon', emoji: '🛡️' },
                        { label: '⚙️ Genel', description: `${commandDatabase.genel.commands.length} komut - Avatar, anket, afk...`, value: 'genel', emoji: '⚙️' },
                        { label: '🎮 Eğlence', description: `${commandDatabase.eğlence.commands.length} komut - Zeinth, çekiliş...`, value: 'eğlence', emoji: '🎮' },
                        { label: '💰 EKONOMİ', description: `⭐ ${commandDatabase.ekonomi.commands.length} komut - DEV SİSTEM! ⭐`, value: 'ekonomi', emoji: '💰' },
                        { label: '📊 Seviye', description: `${commandDatabase.seviye.commands.length} komut - Level, XP...`, value: 'seviye', emoji: '📊' },
                        { label: '🤖 Bot', description: `${commandDatabase.bot.commands.length} komut - Resim, sohbet...`, value: 'bot', emoji: '🤖' }
                    ]);
                
                const row = new ActionRowBuilder().addComponents(selectMenu);
                
                await interaction.update({ embeds: [mainMenuEmbed], components: [row] });
            }
            
            if (interaction.customId === 'yardim_close') { // ✅ customId değişti!
                // Mesajı sil
                await interaction.message.delete().catch(() => {
                    interaction.reply({ content: "❌ Menü kapatıldı.", ephemeral: true });
                });
            }
        }
        
        // 🔍 OTOMATİK TAMAMLAMA İÇİN
        if (interaction.isAutocomplete()) {
            if (interaction.commandName === 'yardim') {
                const focusedValue = interaction.options.getFocused();
                const choices = [
                    { name: `🛡️ Moderasyon (${commandDatabase.moderasyon.commands.length} komut)`, value: 'moderasyon' },
                    { name: `⚙️ Genel (${commandDatabase.genel.commands.length} komut)`, value: 'genel' },
                    { name: `🎮 Eğlence (${commandDatabase.eğlence.commands.length} komut)`, value: 'eğlence' },
                    { name: `💰 EKONOMİ (${commandDatabase.ekonomi.commands.length} komut)`, value: 'ekonomi' },
                    { name: `📊 Seviye (${commandDatabase.seviye.commands.length} komut)`, value: 'seviye' },
                    { name: `🤖 Bot (${commandDatabase.bot.commands.length} komut)`, value: 'bot' }
                ];
                
                const filtered = choices.filter(choice => 
                    choice.name.toLowerCase().includes(focusedValue.toLowerCase())
                );
                
                await interaction.respond(
                    filtered.map(choice => ({ name: choice.name, value: choice.value }))
                );
            }
        }
    });
    
    console.log(`✅ YARDIM MENÜSÜ YÜKLENDİ!`);
    console.log(`📊 Toplam ${totalCommands} komut - Ekonomi: ${commandDatabase.ekonomi.commands.length} komut`);
};