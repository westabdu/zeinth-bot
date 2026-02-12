import { Client, Collection, REST, Routes, GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "fs";
import 'dotenv/config';
const path = require('path'); // en üste ekle

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
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

// --- Komut Yükleyici ---
client.commands = new Collection();
const commandsData = [];

const loadCommands = async () => {
  const categories = readdirSync(path.join(process.cwd(), 'src', 'commands'));
  
  for (const category of categories) {
    const categoryPath = path.join(process.cwd(), 'src', 'commands', category);
    const files = readdirSync(categoryPath).filter(file => file.endsWith(".js"));
    
    for (const file of files) {
      try {
        const filePath = path.join(process.cwd(), 'src', 'commands', category, file);
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
};

// --- Event Yükleyici ---
const loadEvents = async () => {
  const eventsPath = path.join(process.cwd(), 'src', 'events');
  const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".js"));
  
  for (const file of eventFiles) {
    try {
      const filePath = path.join(process.cwd(), 'src', 'events', file);
      const event = await import(`file://${filePath}`).then(m => m.default);
      if (typeof event === 'function') {
        event(client);
        console.log(`✅ Event yüklendi: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Event yüklenirken hata: ${file}`, error.message);
    }
  }
};

// --- Embed Yardımcısı ---
try {
    client.embed = await import("./utils/bot/embed.js").then(m => m.default);
    console.log("✅ Embed yardımcısı yüklendi!");
} catch (error) {
    console.error("❌ Embed yardımcısı yüklenemedi:", error.message);
    // Fallback embed
    client.embed = async(desc, tip = "ana") => {
        const renkler = { ana: 0x5865F2, yesil: 0x00FF00, kirmizi: 0xFF0000, sari: 0xFFD700 };
        return new (await import("discord.js")).EmbedBuilder()
            .setColor(renkler[tip] || 0x5865F2)
            .setDescription(desc);
    };
}

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

// --- Botu Başlat ---
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ .env dosyasında token bulunamadı!");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);