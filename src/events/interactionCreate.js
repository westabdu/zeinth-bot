import cooldown_control from "../utils/cooldown_control.js"

export default client => {
    const { embed } = client

    // 🚨 ASYNC EKLENDİ
    client.on("interactionCreate", async interaction => {
        if (!interaction.isChatInputCommand()) return; // Sadece komutları dinle

        const command = client.commands.get(interaction.commandName)
        if (!command) return

        //! permission control
        if (command.data.permission && !interaction.member.permissions.has(command.data.permission)) {
            return interaction.reply({
                embeds: [embed(`Bu komutu kullanmak için \`${command.data.permission}\` yetkisine sahip olman gerek`, "kirmizi")],
                ephemeral: true
            })
        }

        //! cooldown control
        const cooldown = cooldown_control(command, interaction.member.id)
        if (cooldown) {
            return interaction.reply({
                embeds: [embed(`Bu komutu kullanmak için \`${cooldown}\` saniye beklemelisiniz!`, "kirmizi")],
                ephemeral: true
            })
        }

        //! execute command
        try {
            // 🚨 BURASI ÇOK KRİTİK: AWAIT EKLENDİ
            await command.data.execute(interaction);
        } catch (e) {
            console.error("❌ Komut Hatası:", e);
            const errorEmbed = embed("Bu Komutu Kullanırken Bir Hata Oluştu!", "kirmizi");
            
            // Eğer bot zaten cevap verdiyse (deferReply veya reply) editReply kullanırız
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
            }
        }
    })
}