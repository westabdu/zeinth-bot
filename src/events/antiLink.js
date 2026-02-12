import { PermissionsBitField } from "discord.js";

export default client => {
    client.on('messageCreate', async message => {
        try {
            if (message.author.bot || !message.guild) return;
            
            // Yönetici ve Mesaj Yönetme yetkisi olanlara karışma
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

            const linkler = ["discord.gg", "http", "https", ".com", ".net", ".org", "www."];
            
            if (linkler.some(l => message.content.toLowerCase().includes(l))) {
                await message.delete().catch(() => null);
                const reply = await message.channel.send(`${message.author}, hoop hemşerim! Bu sunucuda link paylaşmak yasak! ❌`);
                setTimeout(() => reply.delete().catch(() => null), 5000);
            }
        } catch (error) {
            console.error("❌ Anti-link hatası:", error);
        }
    });
};