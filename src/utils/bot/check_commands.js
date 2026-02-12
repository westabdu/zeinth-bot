import register_commands from "./register_commands.js"

export default client => {
    // Bot hazır olduğunda tüm sunucuları kontrol et
    client.once('ready', async () => {
        console.log(`🔍 ${client.guilds.cache.size} sunucu kontrol ediliyor...`)
        
        for (const guild of client.guilds.cache.values()) {
            try {
                // Mevcut komutları getir
                const existingCommands = await guild.commands.fetch().catch(() => [])
                const existingCount = existingCommands.size || 0
                const ourCommandCount = Array.from(client.commands.values())
                    .filter(cmd => cmd.slash_data).length
                
                // Eğer sayılar eşit değilse veya hiç komut yoksa kaydet
                if (existingCount !== ourCommandCount) {
                    console.log(`🔄 ${guild.name}: Komutlar güncelleniyor...`)
                    await register_commands(guild)
                } else {
                    console.log(`✓ ${guild.name}: Komutlar güncel`)
                }
                
            } catch (error) {
                console.error(`❌ ${guild.name} kontrol hatası:`, error.message)
            }
        }
        
        console.log("✅ Tüm sunucular kontrol edildi!")
    })
}