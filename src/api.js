// api.js - Zeinth Moderation API Sunucusu
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './utils/database.js'; // Botun database'ini kullan

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001; // 3001 portunda çalışsın (app.js 3000'de çalışıyor)

// CORS ayarları - Web sitemizin erişimine izin ver
app.use(cors({
    origin: ['http://localhost:5500', 'https://westabdu.github.io', 'https://zeinth.abrdns.com'], // Kendi domainlerini ekle
    credentials: true
}));

// JSON verisi göndereceğimiz için
app.use(express.json());

// -------------------- API ENDPOINT'LERİ --------------------

// 1. Ana sayfa - sadece API'nin çalıştığını göstersin
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Zeinth Moderation API çalışıyor!',
        timestamp: new Date().toISOString()
    });
});

// 2. Bot İstatistikleri (en önemli endpoint'imiz!)
app.get('/api/bot-stats', async (req, res) => {
    try {
        // Tüm sunucu verilerini çekelim
        const allKeys = db.all();
        
        // stats_ ile başlayan ve sunucu ID'si içeren key'leri bul
        const guildKeys = allKeys.filter(item => 
            item.id && 
            typeof item.id === 'string' && 
            item.id.startsWith('stats_')
        );
        
        // Sunucu ID'lerini benzersiz olarak al (farklı kullanıcılar aynı sunucuda olabilir)
        const uniqueGuilds = new Set();
        guildKeys.forEach(item => {
            const parts = item.id.split('_');
            if (parts.length >= 3) {
                uniqueGuilds.add(parts[1]); // stats_GUILDID_USERID -> GUILDID
            }
        });
        
        // Toplam komut sayısı (komut klasörünü sayalım - basit bir yöntem)
        let totalCommands = 0;
        try {
            const fs = require('fs');
            const path = require('path');
            const commandsPath = path.join(process.cwd(), 'src', 'commands');
            const categories = fs.readdirSync(commandsPath);
            
            categories.forEach(category => {
                const categoryPath = path.join(commandsPath, category);
                const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
                totalCommands += files.length;
            });
        } catch (e) {
            console.error('Komut sayısı hesaplanamadı:', e);
            totalCommands = 68; // Fallback değer
        }
        
        // Sonuçları gönder
        res.json({
            success: true,
            data: {
                serverCount: uniqueGuilds.size,
                totalUsers: guildKeys.length,
                totalCommands: totalCommands,
                uptime: process.uptime(),
                timestamp: Date.now()
            }
        });
        
    } catch (error) {
        console.error('API hatası:', error);
        res.status(500).json({
            success: false,
            error: 'Sunucu hatası'
        });
    }
});

// 3. Kullanıcı istatistikleri (opsiyonel, ilerisi için)
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const guildId = req.query.guildId; // Hangi sunucudan istediğini belirt
        
        if (!guildId) {
            return res.status(400).json({
                success: false,
                error: 'guildId parametresi gerekli'
            });
        }
        
        const userKey = `stats_${guildId}_${userId}`;
        const userData = db.get(userKey);
        
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'Kullanıcı bulunamadı'
            });
        }
        
        res.json({
            success: true,
            data: {
                level: userData.msg_lv || 1,
                xp: userData.msg_xp || 0,
                cash: userData.cash || 0,
                bank: userData.bank || 0,
                messages: userData.total_messages || 0
            }
        });
        
    } catch (error) {
        console.error('API hatası:', error);
        res.status(500).json({
            success: false,
            error: 'Sunucu hatası'
        });
    }
});

// -------------------- SUNUCUYU BAŞLAT --------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ API sunucusu http://localhost:${PORT} adresinde çalışıyor!`);
    console.log(`📊 Bot istatistikleri için: http://localhost:${PORT}/api/bot-stats`);
});

// Hata yakalama
process.on('unhandledRejection', (error) => {
    console.error('❌ API sunucusu hatası:', error);
});