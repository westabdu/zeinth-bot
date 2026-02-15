import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "kayit-sistemi",
    description: "📝 Butonlu kayıt sistemini kurar",
    permission: "Administrator",
    
    async execute(interaction) {
        // Yetki Kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
             return interaction.reply({ content: "❌ Yönetici yetkin yok!", ephemeral: true });
        }

        const altKomut = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // 1. AYARLA
        if (altKomut === "ayarla") {
            const kayitsiz = interaction.options.getRole("kayitsiz_rol");
            const kayitli = interaction.options.getRole("kayitli_rol");

            await db.set(`kayit_roller_${guildId}`, {
                kayitsizRol: kayitsiz.id,
                kayitliRol: kayitli.id
            });

            return interaction.reply({ content: `✅ Roller ayarlandı!\nKayıtsız: ${kayitsiz}\nKayıtlı: ${kayitli}`, ephemeral: true });
        }

        // 2. KUR
        if (altKomut === "kur") {
            await interaction.deferReply({ ephemeral: true });
            
            // Önce ayarları kontrol et (AWAIT ÖNEMLİ)
            const ayarlar = await db.get(`kayit_roller_${guildId}`);
            if (!ayarlar) return interaction.editReply("❌ Önce rolleri ayarlamalısın!");

            const kanal = interaction.options.getChannel("kanal") || interaction.channel;
            const embed = new EmbedBuilder()
                .setTitle("Sunucu Kayıt")
                .setDescription("Kayıt olmak için butona tıkla!")
                .setColor("Green");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("kayit_ol_buton") // 🟢 HERKES TIKLAYABİLSİN DİYE SABİT YAPTIK
                    .setLabel("Kayıt Ol")
                    .setStyle(ButtonStyle.Success)
            );

            const mesaj = await kanal.send({ embeds: [embed], components: [row] });

            // Paneli kaydet (Format: kayit_panel_MESAJID_GUILDID)
            await db.set(`kayit_panel_${mesaj.id}_${guildId}`, {
                kayitsizRolId: ayarlar.kayitsizRol,
                kayitliRolId: ayarlar.kayitliRol
            });

            return interaction.editReply("✅ Panel kuruldu!");
        }

        // 3. SIFIRLA
        if (altKomut === "sifirla") {
            await db.delete(`kayit_roller_${guildId}`);
            return interaction.reply({ content: "✅ Ayarlar sıfırlandı.", ephemeral: true });
        }
    }
};

// Slash Data kısmı aynı kalabilir...
export const slash_data = new SlashCommandBuilder()
    .setName("kayit-sistemi")
    .setDescription("Kayıt sistemi işlemleri")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("ayarla").setDescription("Rolleri ayarla")
        .addRoleOption(o => o.setName("kayitsiz_rol").setDescription("Verilecek rol").setRequired(true))
        .addRoleOption(o => o.setName("kayitli_rol").setDescription("Alınacak rol").setRequired(true)))
    .addSubcommand(s => s.setName("kur").setDescription("Paneli kur")
        .addChannelOption(o => o.setName("kanal").setDescription("Kanal seç")))
    .addSubcommand(s => s.setName("sifirla").setDescription("Sistemi sıfırla"));