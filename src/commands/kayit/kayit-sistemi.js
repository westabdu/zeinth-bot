import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "kayit-sistemi",
    description: "📝 Butonlu kayıt sistemini kurar",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ 
                    content: "❌ Bu komutu sadece yöneticiler kullanabilir!", 
                    ephemeral: true 
                });
            }

            const altKomut = interaction.options.getSubcommand();

            if (altKomut === "kur") {
                await kurKayitPaneli(interaction);
            } else if (altKomut === "ayarla") {
                await ayarlaRoller(interaction);
            } else if (altKomut === "sifirla") {
                await sifirlaSistem(interaction);
            }

        } catch (error) {
            console.error("❌ Kayıt sistemi hatası:", error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: "❌ Bir hata oluştu!", 
                    ephemeral: true 
                }).catch(() => {});
            }
        }
    }
};

async function ayarlaRoller(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const kayitsizRol = interaction.options.getRole("kayitsiz_rol");
    const kayitliRol = interaction.options.getRole("kayitli_rol");

    if (!kayitsizRol || !kayitliRol) {
        return interaction.editReply({ 
            content: "❌ Lütfen geçerli roller seç!" 
        });
    }

    // Bot yetki kontrolü
    if (interaction.guild.members.me.roles.highest.comparePositionTo(kayitsizRol) <= 0) {
        return interaction.editReply({
            content: `❌ **${kayitsizRol.name}** rolünü verebilmek için bot rolü **bu rolden yukarıda** olmalı!`
        });
    }

    if (interaction.guild.members.me.roles.highest.comparePositionTo(kayitliRol) <= 0) {
        return interaction.editReply({
            content: `❌ **${kayitliRol.name}** rolünü verebilmek için bot rolü **bu rolden yukarıda** olmalı!`
        });
    }

    const guildId = interaction.guild.id;
    await db.set(`kayit_roller_${guildId}`, {
        kayitsizRol: kayitsizRol.id,
        kayitliRol: kayitliRol.id,
        ayarlayan: interaction.user.id,
        ayarTarihi: Date.now()
    });

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle("✅ Kayıt Rolleri Ayarlandı")
        .addFields(
            { name: "📛 Kayıtsız Rolü", value: `${kayitsizRol}`, inline: true },
            { name: "✅ Kayıtlı Rolü", value: `${kayitliRol}`, inline: true }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function kurKayitPaneli(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const kanal = interaction.options.getChannel("kanal") || interaction.channel;
    const baslik = interaction.options.getString("baslik") || "📋 **Sunucuya Kayıt Ol**";
    const aciklama = interaction.options.getString("aciklama") || "Aşağıdaki butona tıklayarak sunucuya kayıt olabilirsin!";

    const guildId = interaction.guild.id;
    const kayitRoller = await db.get(`kayit_roller_${guildId}`);

    if (!kayitRoller || !kayitRoller.kayitsizRol || !kayitRoller.kayitliRol) {
        return interaction.editReply({ 
            content: "❌ Önce `/kayit-sistemi ayarla` komutuyla **Kayıtsız** ve **Kayıtlı** rollerini belirlemelisin!" 
        });
    }

    const kayitsizRol = interaction.guild.roles.cache.get(kayitRoller.kayitsizRol);
    const kayitliRol = interaction.guild.roles.cache.get(kayitRoller.kayitliRol);

    if (!kayitsizRol || !kayitliRol) {
        return interaction.editReply({ 
            content: "❌ Ayarlanan roller sunucuda bulunamadı! Lütfen rolleri tekrar ayarla." 
        });
    }

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(baslik)
        .setDescription(aciklama)
        .addFields(
            { name: "📌 Kayıt Olunca:", value: `✅ **${kayitsizRol.name}** rolün silinecek\n✅ **${kayitliRol.name}** rolün eklenecek`, inline: false },
            { name: "⚠️ Not", value: "Butona sadece **1 kere** tıklayabilirsin!", inline: false }
        )
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`kayit_ol_${interaction.user.id}`)
            .setLabel("📝 Kayıt Ol")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success)
    );

    const panelMesaji = await kanal.send({ embeds: [embed], components: [row] });

    await db.set(`kayit_panel_${guildId}_${panelMesaji.id}`, {
        mesajId: panelMesaji.id,
        kanalId: kanal.id,
        kayitsizRolId: kayitsizRol.id,
        kayitliRolId: kayitliRol.id,
        olusturan: interaction.user.id,
        olusturmaTarihi: Date.now()
    });

    await interaction.editReply({
        content: `✅ **Kayıt paneli başarıyla kuruldu!**\n📌 Kanal: ${kanal}\n🆔 Mesaj ID: \`${panelMesaji.id}\``
    });
}

async function sifirlaSistem(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const guildId = interaction.guild.id;
    
    await db.delete(`kayit_roller_${guildId}`);
    
    // Tüm panelleri sil
    const allKeys = await db.all();
    allKeys.forEach(async item => {
        if (item.id?.startsWith(`kayit_panel_${guildId}`)) {
            await db.delete(item.id);
        }
    });

    await interaction.editReply({ 
        content: "✅ **Kayıt sistemi tamamen sıfırlandı!** Tüm ayarlar ve paneller silindi." 
    });
}

export const slash_data = new SlashCommandBuilder()
    .setName("kayit-sistemi")
    .setDescription("📝 Butonlu kayıt sistemini yönet")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
        sub.setName("kur")
            .setDescription("Kayıt panelini kur")
            .addChannelOption(opt => opt.setName("kanal").setDescription("Panelin gönderileceği kanal").setRequired(false))
            .addStringOption(opt => opt.setName("baslik").setDescription("Panel başlığı").setRequired(false))
            .addStringOption(opt => opt.setName("aciklama").setDescription("Panel açıklaması").setRequired(false)))
    .addSubcommand(sub =>
        sub.setName("ayarla")
            .setDescription("Kayıtsız ve kayıtlı rollerini belirle")
            .addRoleOption(opt => opt.setName("kayitsiz_rol").setDescription("Yeni üyelere verilecek kayıtsız rolü").setRequired(true))
            .addRoleOption(opt => opt.setName("kayitli_rol").setDescription("Kayıt olunca verilecek rol").setRequired(true)))
    .addSubcommand(sub =>
        sub.setName("sifirla")
            .setDescription("Tüm kayıt sistemini sıfırla"));