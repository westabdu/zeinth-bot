import register_commands from "../utils/bot/register_commands.js";

export default client => {
    client.on("guildCreate", async guild => {
        try {
            await register_commands(guild);
            console.log(`✅ Sunucuya katıldım: ${guild.name} (${guild.id})`);
        } catch (error) {
            console.error(`❌ Sunucuya katılırken komut kayıt hatası: ${guild.id}`, error);
        }
    });
};