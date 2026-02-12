import cooldown_control from "../utils/cooldown_control.js"

export default client => {

    const { embed } = client

    client.on("interactionCreate", interaction => {

        const command = client.commands.get(interaction.commandName)

        if(!command) return

        //! permission control
        if(command.data.permission && !interaction.member.permissions.has(command.data.permission)) return interaction.reply({
            embeds: [
                embed(`Bu komutu kullanmak için \`${command.data.permission}\` yetkisine sahip olman gerek`,"kirmizi")
            ]
        })

        //! cooldown control
        const cooldown = cooldown_control(command, interaction.member.id)
        if(cooldown) return interaction.reply({
            embeds: [
                embed(`Bu komutu kullanmak için \`${cooldown}\` saniye beklemelisiniz!`,"kirmizi")
            ]
        })


        //! execute command
        try {
            command.data.execute(interaction)
        } catch(e){
            interaction.reply({embeds: [embed("Bu Komutu Kullanırken Bir Hata Oluştu!", "kirmizi")]})
            console.log(e)
        }

    })

}