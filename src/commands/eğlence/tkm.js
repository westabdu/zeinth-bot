// commands/oyun/tkm.js
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "tkm",
    description: "✂️ Bot ile taş-kağıt-makas oyna",
    async execute(interaction) {
        const secim = interaction.options.getString("secim");
        
        const botSecimleri = ["taş", "kağıt", "makas"];
        const botSecim = botSecimleri[Math.floor(Math.random() * botSecimleri.length)];
        
        let sonuc;
        let renk;
        
        if (secim === botSecim) {
            sonuc = "🤝 **Berabere!**";
            renk = 0xFFFF00;
        } else if (
            (secim === "taş" && botSecim === "makas") ||
            (secim === "kağıt" && botSecim === "taş") ||
            (secim === "makas" && botSecim === "kağıt")
        ) {
            sonuc = "🎉 **Kazandın!**";
            renk = 0x00FF00;
        } else {
            sonuc = "😢 **Kaybettin!**";
            renk = 0xFF0000;
        }
        
        const embed = new EmbedBuilder()
            .setColor(renk)
            .setTitle("✂️ Taş-Kağıt-Makas")
            .addFields(
                { name: "Senin seçimin", value: `**${secim.toUpperCase()}**`, inline: true },
                { name: "Botun seçimi", value: `**${botSecim.toUpperCase()}**`, inline: true },
                { name: "Sonuç", value: sonuc, inline: false }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("tkm")
    .setDescription("✂️ Bot ile taş-kağıt-makas oyna")
    .addStringOption(opt => 
        opt.setName("secim")
            .setDescription("Seçimini yap")
            .setRequired(true)
            .addChoices(
                { name: "🪨 Taş", value: "taş" },
                { name: "📄 Kağıt", value: "kağıt" },
                { name: "✂️ Makas", value: "makas" }
            ));