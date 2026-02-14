// events/capslockGuard.js
import Guild from '../models/Guild.js';

export default client => {
    client.on('messageCreate', async message => {
        if (message.author.bot || !message.guild) return;

        try {
            // Sunucu ayarlarını al
            const settings = await Guild.findOne({ guildId: message.guild.id });
            
            // Özellik aktif değilse veya yetkiliyse karışma
            if (!settings?.automod?.antiCapslock) return;
            if (message.member.permissions.has('ManageMessages')) return;

            const mesaj = message.content;
            if (!mesaj) return;

            // Büyük harf oranını hesapla
            const harfler = mesaj.replace(/[^a-zA-Z]/g, ''); // Sadece harfleri al
            if (harfler.length < 4) return; // Çok kısa mesajları kontrol etme
            
            const buyukHarfSayisi = (mesaj.match(/[A-Z]/g) || []).length;
            const toplamHarfSayisi = harfler.length;
            const oran = (buyukHarfSayisi / toplamHarfSayisi) * 100;

            // Eğer mesajın %70'ten fazlası büyük harfse
            if (oran > 70) {
                await message.delete();
                
                const uyari = await message.channel.send({
                    content: `${message.author}, lütfen **çok fazla büyük harf kullanma**! (${oran.toFixed(1)}%)`
                });
                
                setTimeout(() => uyari.delete().catch(() => null), 5000);

                // Log kanalı varsa oraya da bildir
                if (settings.automod.logChannel) {
                    const logKanal = message.guild.channels.cache.get(settings.automod.logChannel);
                    if (logKanal) {
                        const embed = new EmbedBuilder()
                            .setColor('Orange')
                            .setTitle('🔠 Capslock Engellendi')
                            .setDescription(`${message.author} mesajı büyük harf oranı yüksek olduğu için silindi.`)
                            .addFields(
                                { name: 'Kullanıcı', value: `${message.author.tag}`, inline: true },
                                { name: 'Oran', value: `%${oran.toFixed(1)}`, inline: true },
                                { name: 'Kanal', value: `${message.channel}`, inline: true }
                            )
                            .setTimestamp();
                        await logKanal.send({ embeds: [embed] });
                    }
                }
            }
        } catch (error) {
            console.error('❌ Capslock koruması hatası:', error);
        }
    });
};