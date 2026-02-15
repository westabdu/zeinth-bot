import { Client, Collection, REST, Routes, GatewayIntentBits, Partials, EmbedBuilder } from "discord.js";
import { readdirSync } from "fs";
import 'dotenv/config';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { DisTube } from "distube";
import { SpotifyPlugin } from "@distube/spotify";
import { SoundCloudPlugin } from "@distube/soundcloud";

//event handler'lar
import connectDB from './database/mongoose.js';
import muzikHandler from "./events/muzikHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildVoiceStates, // ⚡ BU ÇOK ÖNEMLİ!
        GatewayIntentBits.GuildPresences
    ],
    presence: { 
        status: "idle", 
        activities: [{ name: "Zenith Moderation!", type: 0 }] 
    },
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.ThreadMember
    ]
});

// DisTube kurulumu
client.distube = new DisTube(client, {
    emitNewSongOnly: true, // Sadece yeni şarkı başladığında event fırlat
    leaveOnEmpty: true, // Kanal boşalınca çık
    leaveOnFinish: true, // Sıra bitince çık
    leaveOnStop: true, // Durdurulunca çık
    plugins: [
        new SpotifyPlugin(), // Spotify desteği için
        new SoundCloudPlugin() // SoundCloud desteği için
    ]
});

// Müzik handler'ını başlat
muzikHandler(client);

// --- Komut Yükleyici ---
client.commands = new Collection();
const commandsData = [];

const loadCommands = async () => {
    try {
        const commandsPath = path.join(__dirname, 'commands');
        const categories = readdirSync(commandsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        for (const category of categories) {
            const categoryPath = path.join(commandsPath, category);
            const files = readdirSync(categoryPath).filter(file => file.endsWith(".js"));
            
            for (const file of files) {
                try {
                    const filePath = path.join(categoryPath, file);
                    const command = await import(`file://${filePath}`);
                    
                    if (command.data && command.data.name) {
                        client.commands.set(command.data.name, command);
                        if (command.slash_data) commandsData.push(command.slash_data.toJSON());
                        console.log(`✅ Komut yüklendi: ${command.data.name}`);
                    }
                } catch (error) {
                    console.error(`❌ Komut yüklenirken hata: ${category}/${file}`, error.message);
                }
            }
        }
    } catch (error) {
        console.error("❌ Komut klasörü bulunamadı:", error.message);
    }
};

// --- Event Yükleyici ---
const loadEvents = async () => {
    try {
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".js"));
        
        for (const file of eventFiles) {
            try {
                const filePath = path.join(eventsPath, file);
                const event = await import(`file://${filePath}`).then(m => m.default);
                if (typeof event === 'function') {
                    event(client);
                    console.log(`✅ Event yüklendi: ${file}`);
                }
            } catch (error) {
                console.error(`❌ Event yüklenirken hata: ${file}`, error.message);
            }
        }
    } catch (error) {
        console.error("❌ Event klasörü bulunamadı:", error.message);
    }
};

// --- Embed Yardımcısı ---
client.embed = (desc, tip = "ana") => {
    try {
        const renkler = { ana: 0x5865F2, yesil: 0x00FF00, kirmizi: 0xFF0000, sari: 0xFFD700 };
        return new EmbedBuilder()
            .setColor(renkler[tip] || 0x5865F2)
            .setDescription(desc);
    } catch (error) {
        console.error("❌ Embed oluşturma hatası:", error);
        return { color: 0x5865F2, description: desc };
    }
};

// --- Health Check Sunucusu ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Zeinth Moderation Bot is running!\n');
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Health check sunucusu çalışıyor: ${PORT}`);
});

// --- Ready Event ---
client.once("ready", async () => {
    console.log(`🤖 ${client.user.tag} aktif!`);
    
    await loadCommands();
    await loadEvents();
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log("♻️ Slash komutlar yenileniyor...");
        await rest.put(Routes.applicationCommands(client.user.id), { body: commandsData });
        console.log(`✅ ${commandsData.length} slash komut başarıyla yüklendi!`);
    } catch (error) {
        console.error("❌ Slash komut yükleme hatası:", error);
    }
    
    console.log(`🚀 ${client.user.tag} göreve hazır!`);
});

// --- Hata Yakalama ---
process.on('unhandledRejection', error => {
    console.error('❌ Yakalanmamış hata:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Yakalanmamış istisna:', error);
});

connectDB();

// --- Botu Başlat ---
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ DISCORD_TOKEN environment variable bulunamadı!");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);