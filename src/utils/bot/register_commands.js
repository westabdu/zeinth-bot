import { REST } from "discord.js"
import { Routes } from "discord-api-types/v10"  // 👈 v9 yerine v10

export default async guild => {
    const { client } = guild
    const rest = new REST({ version: "10" }).setToken(process.env.token)  // 👈 v10

    // Sadece slash_data olan komutları al
    const body = []
    client.commands.forEach(command => {
        if (command.slash_data) {
            body.push(command.slash_data.toJSON())
        }
    })

    if (body.length === 0) {
        console.log("⚠️ Kaydedilecek slash komutu yok!")
        return
    }

    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guild.id),  // 👈 Guild-specific
            { body }
        )
        console.log(`✅ ${guild.name} sunucusuna ${body.length} komut kaydedildi`)
    } catch (e) {
        console.error(`❌ ${guild.name} komut kaydetme hatası:`, e.message)
    }
}