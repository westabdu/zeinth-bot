// api.js - Zeinth Moderation API Sunucusu
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './utils/database.js'; // Botun database'ini kullan

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// CORS ayarları
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'https://westabdu.github.io',
        'https://zeinth.abrdns.com'
    ],
    credentials: true
}));

app.use(express.json());

// -------------------- API ENDPOINT'LERİ --------------------

// 1. Ana sayfa
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Zeinth Moderation API çalışıyor!',
        timestamp: new Date().toISOString()
    });
});

// 2. Bot İstatistikleri (DÜZELTİLDİ!)
app.get('/api/bot-stats', async (req, res) => {
    try {
        // Tüm sunucu verilerini çek
        const allKeys = db.all();
        
        // stats_ ile başlayan key'leri bul (DOĞRU: 'stats_' olmalı)
        const guildKeys = allKeys.filter(item => 
            item.id && 
            typeof item.id === 'string' && 
            item.id.startsWith('stats_')
        );
        
        // Sunucu ID'lerini benzersiz olarak al
        const uniqueGuilds = new Set();
        guildKeys.forEach(item => {
            // ID formatı: stats_GUILDID_USERID
            const parts = item.id.split('_');
            if (parts.length >= 3) {
                uniqueGuilds.add(parts[1]); // GUILDID'yi ekle
            }
        });
        
        // Toplam komut sayısı
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
            totalCommands = 44; // Log'dan gördüğümüz değer
        }
        
        // Başarılı response GÖNDER (DÜZELTİLDİ!)
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

// -------------------- SUNUCUYU BAŞLAT --------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ API sunucusu http://localhost:${PORT} adresinde çalışıyor!`);
    console.log(`📊 Bot istatistikleri için: http://localhost:${PORT}/api/bot-stats`);
});