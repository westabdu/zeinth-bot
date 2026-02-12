import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import cekilisDB from "../../utils/cekilisDB.js";
import { sonuclandirCekilis } from "../../events/cekilisHandler.js"; // ✅ DOĞRU IMPORT!

// Süre parser
function parseTime(timeString) {
    const regex = /^(\d+)([hmd])$/;
    const match = timeString?.toLowerCase().match(regex);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

export const data = {
    name: "çekiliş",
    description: "Yeni bir çekiliş başlatır",
    permission: "ManageMessages",
    
    async execute(interaction) {
        const odul = interaction.options.getString("ödül");
        const kazananSayisi = interaction.options.getInteger("kazanan");
        const sure = interaction.options.getString("süre");
        const kanal = interaction.options.getChannel("kanal") || interaction.channel;
        
        // ✅ Değişken ismi düzeltildi!
        if (kazananSayisi < 1 || kazananSayisi > 20) {
            return interaction.reply({ 
                content: "❌ Kazanan sayısı 1-20 arasında olmalıdır!", 
                ephemeral: true 
            });
        }
        
        const sureMs = parseTime(sure);
        if (!sureMs) {
            return interaction.reply({ 
                content: "❌ Geçersiz süre formatı! Örnek: `1h` (1 saat), `30m` (30 dakika), `1d` (1 gün)", 
                ephemeral: true 
            });
        }
        
        const bitisZamani = Date.now() + sureMs;
        
        // Embed oluştur
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle("🎉 YENİ ÇEKİLİŞ!")
            .setDescription(`**Ödül:** ${odul}\n**Kazanan Sayısı:** ${kazananSayisi} kişi`)
            .addFields(
                { name: "⏳ Bitiş Süresi", value: `<t:${Math.floor(bitisZamani / 1000)}:R>`, inline: true },
                { name: "👥 Katılımcılar", value: "0", inline: true },
                { name: "🎫 Katılım", value: "Aşağıdaki butona tıkla!", inline: true }
            )
            .setFooter({ text: `Başlatan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp(bitisZamani);
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("cekilis_katil")
                .setLabel("🎫 Katıl!")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("cekilis_durum")
                .setLabel("📊 Durum")
                .setStyle(ButtonStyle.Secondary)
        );
        
        const message = await kanal.send({ embeds: [embed], components: [row] });
        
        const cekilisId = `cekilis_${message.id}`;
        cekilisDB.set(cekilisId, {
            odul,
            kazananSayisi,
            baslatan: interaction.user.id,
            baslatanTag: interaction.user.tag,
            kanalId: kanal.id,
            mesajId: message.id,
            bitisZamani,
            katilimcilar: [],
            sonuclandi: false,
            createdAt: Date.now()
        });
        
        await interaction.reply({ 
            content: `✅ Çekiliş başlatıldı! ${kanal} kanalına gönderildi.`, 
            ephemeral: true 
        });
        
        // ⏰ Zamanlayıcı
        setTimeout(async () => {
            await sonuclandirCekilis(cekilisId, message);
        }, sureMs);
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("çekiliş")
    .setDescription("Yeni bir çekiliş başlatır")
    .addStringOption(option =>
        option.setName("ödül")
            .setDescription("Çekiliş ödülü nedir?")
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName("kazanan")
            .setDescription("Kaç kişi kazanacak?")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("süre")
            .setDescription("Süre (örn: 1h, 30m, 1d)")
            .setRequired(true))
    .addChannelOption(option =>
        option.setName("kanal")
            .setDescription("Çekiliş hangi kanalda olacak?")
            .setRequired(false));