import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const data = {
    name: "ticket-kur",
    description: "Ticket (Destek) panelini kurar.",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const kanal = interaction.options.getChannel('kanal');
            const baslik = interaction.options.getString('baslik') || "Destek Talebi";
            const aciklama = interaction.options.getString('aciklama') || "Destek talebi oluşturmak için aşağıdaki butona tıklayın.";

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`📩 ${baslik}`)
                .setDescription(aciklama)
                .setFooter({ text: "Zenith Ticket System" });

            const row = new ActionRowBuilder().addComponents(  
                new ButtonBuilder()
                    .setCustomId('ticket_olustur')
                    .setLabel('Destek Talebi Oluştur')
                    .setEmoji('📩')
                    .setStyle(ButtonStyle.Primary)
            );

            await kanal.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: `✅ Ticket paneli <#${kanal.id}> kanalına kuruldu!`, ephemeral: true });
        } catch (error) {
            console.error("❌ Ticket-kur komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("ticket-kur")
    .setDescription("Ticket panelini gönderir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt => opt.setName("kanal").setDescription("Panelin atılacağı kanal").setRequired(true))
    .addStringOption(opt => opt.setName("baslik").setDescription("Panel başlığı").setRequired(false))
    .addStringOption(opt => opt.setName("aciklama").setDescription("Panel açıklaması").setRequired(false));