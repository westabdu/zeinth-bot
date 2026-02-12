import { PermissionsBitField } from "discord.js";

export default client => {
    client.on('messageCreate', async message => {
        try {
            if (message.author.bot || !message.guild) return;
            
            if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

            const kufurler = ["mk", "amk", "aq", "orospu", "pic", "yavşak", "piç", "sik", "yarrak", "ananın amı", "oruspu çocuğu", "oç", "oe", "sik kafası", "amcık surat", "ananı sikim"];
            
            const content = message.content.toLowerCase().split(" ");
            
            if (content.some(kelime => kufurler.includes(kelime))) {
                await message.delete();
                const warning = await message.channel.send({ 
                    content: `${message.author}, hoop hemşerim! Bu sunucuda küfür yasak. 🚨` 
                });
                setTimeout(() => warning.delete().catch(() => null), 5000);
            }
        } catch (error) {
            console.error("❌ Anti-küfür hatası:", error);
        }
    });
};