// commands/genel/hatirlat.js
import { SlashCommandBuilder } from "discord.js";

export const data = {
    name: "hatirlat",
    description: "⏰ Belirli süre sonra sana hatırlatma yapar",
    async execute(interaction) {
        const sure = interaction.options.getInteger("dakika");
        const mesaj = interaction.options.getString("mesaj");
        
        await interaction.reply({ 
            content: `⏰ **${sure} dakika** sonra sana hatırlatacağım: "${mesaj}"`, 
            ephemeral: true 
        });
        
        setTimeout(async () => {
            try {
                await interaction.user.send(`⏰ **Hatırlatma:** ${mesaj}`);
            } catch (error) {
                // DM kapalıysa özel mesaj atamaz, kanala düşürebiliriz
                await interaction.channel.send(`${interaction.user}, sana hatırlatmam gerekiyordu ama DM kapalı! ⏰ **${mesaj}**`);
            }
        }, sure * 60 * 1000);
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("hatirlat")
    .setDescription("⏰ Belirli süre sonra sana hatırlatma yapar")
    .addIntegerOption(opt => 
        opt.setName("dakika")
            .setDescription("Kaç dakika sonra?")
            .setRequired(true)
            .setMinValue(1))
    .addStringOption(opt => 
        opt.setName("mesaj")
            .setDescription("Ne hatırlatayım?")
            .setRequired(true));