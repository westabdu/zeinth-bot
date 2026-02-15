// events/interactionCreate.js - Gelişmiş versiyon (bazı komutlar hemen cevap verir)

import cooldown_control from "../utils/cooldown_control.js"

export default client => {
    const { embed } = client

    client.on("interactionCreate", async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName)
        if (!command) return

        try {
            // 🎯 HEMEN CEVAP VERMESİ GEREKEN KOMUTLAR (defer YAPMA!)
            const anlikKomutlar = ['ping', 'test', 'yardim']; // Bu komutlar defer yapmadan direkt cevap verir
            
            if (!anlikKomutlar.includes(interaction.commandName)) {
                // Uzun süren komutlar için defer yap
                await interaction.deferReply().catch(() => {});
            }

            // Yetki kontrolü
            if (command.data.permission && !interaction.member.permissions.has(command.data.permission)) {
                const hataEmbed = embed(`Bu komutu kullanmak için \`${command.data.permission}\` yetkisine sahip olman gerek`, "kirmizi");
                
                if (interaction.deferred) {
                    return interaction.editReply({ embeds: [hataEmbed] });
                } else {
                    return interaction.reply({ embeds: [hataEmbed], ephemeral: true });
                }
            }

            // Cooldown kontrolü
            const cooldown = cooldown_control(command, interaction.member.id)
            if (cooldown) {
                const hataEmbed = embed(`Bu komutu kullanmak için \`${cooldown}\` saniye beklemelisiniz!`, "kirmizi");
                
                if (interaction.deferred) {
                    return interaction.editReply({ embeds: [hataEmbed] });
                } else {
                    return interaction.reply({ embeds: [hataEmbed], ephemeral: true });
                }
            }

            // Komutu çalıştır
            await command.data.execute(interaction);
            
        } catch (error) {
            console.error("❌ Komut Hatası:", error);
            
            const hataMesaji = embed("Bu komutu kullanırken bir hata oluştu!", "kirmizi");
            
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [hataMesaji] }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [hataMesaji], ephemeral: true }).catch(() => {});
            }
        }
    })
}