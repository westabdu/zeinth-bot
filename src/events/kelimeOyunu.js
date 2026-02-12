import db from "../utils/database.js";

// 🏆 KELİME OYUNU - GELİŞMİŞ VERSİYON
export default client => {
    client.on('messageCreate', async message => {
        try {
            // Bot mesajlarını ve DM'leri atla
            if (message.author.bot || !message.guild) return;

            // 🎮 Kanal kontrolü
            const gameChannelId = db.get(`kelime_kanal_${message.guild.id}`);
            if (!gameChannelId || message.channel.id !== gameChannelId) return;

            const guildId = message.guild.id;
            const userId = message.author.id;
            const userKey = `stats_${guildId}_${userId}`;
            let userData = db.get(userKey) || { cash: 0, bank: 0, msg_lv: 1, total_earned: 0 };

            // 📦 Oyun verilerini al
            const gameKey = `kelime_oyun_${guildId}`;
            let gameData = db.get(gameKey) || {
                sonKelime: "elma",
                sonKullanici: null,
                toplamKelime: 0,
                skorlar: {},
                sonUcKullanici: [] // Son 3 kullanıcıyı tut
            };

            const yazilan = message.content.trim().toLowerCase();
            
            // ❌ Geçersiz kelime (çok kısa, sayı, özel karakter)
            if (yazilan.length < 2 || !/^[a-zığüşöç]+$/.test(yazilan)) {
                await message.delete().catch(() => null);
                const reply = await message.channel.send(`❌ ${message.author}, sadece **Türkçe harflerden** oluşan en az **2 harfli** kelime yazabilirsin!`);
                setTimeout(() => reply.delete().catch(() => null), 3000);
                return;
            }

            // 🚫 1. AYNI KULLANICI ÜST ÜSTE YAZAMAZ
            if (gameData.sonKullanici === userId) {
                await message.delete().catch(() => null);
                const reply = await message.channel.send(`😅 ${message.author}, sıranı bekle!`);
                setTimeout(() => reply.delete().catch(() => null), 3000);
                return;
            }

            // 🔤 2. SON HARF KONTROLÜ
            let sonHarf = gameData.sonKelime.slice(-1);
            // 'ğ' 'g' olarak kabul et, 'ş' 's', 'ç' 'c', 'ö' 'o', 'ü' 'u'
            const harfDonusum = {
                'ğ': 'g', 'ş': 's', 'ç': 'c', 'ö': 'o', 'ü': 'u',
                'ı': 'i', 'Ğ': 'g', 'Ş': 's', 'Ç': 'c', 'Ö': 'o', 'Ü': 'u', 'İ': 'i'
            };
            sonHarf = harfDonusum[sonHarf] || sonHarf;
            
            const ilkHarf = yazilan.charAt(0);
            const donusmusIlkHarf = harfDonusum[ilkHarf] || ilkHarf;
            
            if (donusmusIlkHarf !== sonHarf) {
                await message.delete().catch(() => null);
                const reply = await message.channel.send(`❌ ${message.author}, kelime **"${sonHarf}"** ile başlamalı!`);
                setTimeout(() => reply.delete().catch(() => null), 3000);
                return;
            }

            // ✅ BAŞARILI!
            
            // Son 3 kullanıcıyı güncelle
            if (!gameData.sonUcKullanici) gameData.sonUcKullanici = [];
            gameData.sonUcKullanici.push(userId);
            if (gameData.sonUcKullanici.length > 3) {
                gameData.sonUcKullanici.shift();
            }
            
            // Yeni kelimeyi kaydet
            gameData.sonKelime = yazilan;
            gameData.sonKullanici = userId;
            gameData.toplamKelime = (gameData.toplamKelime || 0) + 1;
            
            // 🏅 SKOR TABLOSU
            if (!gameData.skorlar) gameData.skorlar = {};
            gameData.skorlar[userId] = (gameData.skorlar[userId] || 0) + 1;
            
            db.set(gameKey, gameData);

            // 💰 EKONOMİ ÖDÜLÜ
            let odul = 2; // baz ödül
            
            // Kelime uzunluğu bonusu (her harf +0.5 ZenCoin)
            odul += Math.floor(yazilan.length * 0.5);
            
            // Streak bonusu (son 3'te yoksa yeni kullanıcı bonusu)
            if (!gameData.sonUcKullanici?.slice(0, -1).includes(userId)) {
                odul += 3;
            }
            
            // 🎲 Rastgele bonus (%10 şansla 2x)
            let bonusCarpani = 1;
            if (Math.random() < 0.1) {
                bonusCarpani = 2;
                await message.react('🎲').catch(() => null);
            }
            
            odul *= bonusCarpani;

            // Kullanıcıya parayı ekle
            userData.cash = (userData.cash || 0) + odul;
            userData.total_earned = (userData.total_earned || 0) + odul;
            db.set(userKey, userData);

            // ✅ Başarılı reaksiyonu
            await message.react('✅').catch(() => null);

            // 💬 Bilgi mesajı (%30 şansla)
            if (Math.random() < 0.3) {
                const infoMsg = await message.channel.send(
                    `✅ **${message.author.username}** +${odul} ZenCoin kazandı! (Kelime: ${yazilan})`
                );
                setTimeout(() => infoMsg.delete().catch(() => null), 5000);
            }

            console.log(`📝 Kelime oyunu: ${message.author.tag} - ${yazilan} (+${odul} ZenCoin)`);

        } catch (error) {
            console.error("❌ Kelime oyunu hatası:", error);
        }
    });

    console.log("✅ KELİME OYUNU YÜKLENDİ!");
};