import cooldown_control from "../utils/cooldown_control.js"

export default client => {
    const { embed } = client

    // Callback fonksiyonunu "async" yapıyoruz!
    client.on("interactionCreate", async interaction => {
        // Sadece slash komutlarını kontrol et (butonlar handler'da)
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName)
        if(!command) return

        //! permission control
        if(command.data.permission && !interaction.member.permissions.has(command.data.permission)) {
            return interaction.reply({
                embeds: [embed(`Bu komutu kullanmak için \`${command.data.permission}\` yetkisine sahip olman gerek`,"kirmizi")],
                ephemeral: true
            })
        }

        //! cooldown control
        const cooldown = cooldown_control(command, interaction.member.id)
        if(cooldown) {
            return interaction.reply({
                embeds: [embed(`Bu komutu kullanmak için \`${cooldown}\` saniye beklemelisiniz!`,"kirmizi")],
                ephemeral: true
            })
        }

        //! execute command
        try {
            // AWAIT ekledik ki komut bitene kadar beklesin
            await command.data.execute(interaction) 
        } catch(e){
            console.error("❌ Komut Hatası:", e)
            
            // Eğer bot zaten cevap verdiyse editReply, vermediyse reply kullan
            const errorEmbed = embed("Bu Komutu Kullanırken Bir Hata Oluştu!", "kirmizi");
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
            }
        }
    })
}