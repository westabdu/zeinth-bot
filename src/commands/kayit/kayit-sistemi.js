import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "kayit-sistemi",
    description: "📝 Butonlu kayıt sistemini kurar",
    
    async execute(interaction) {
        // Yetki kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: "❌ Bu komutu kullanmak için yönetici yetkisine sahip olmalısın!", 
                ephemeral: true 
            });
        }

        const altKomut = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            // 1. AYARLA - Rolleri ayarla
            if (altKomut === "ayarla") {
                const kayitsiz = interaction.options.getRole("kayitsiz_rol");
                const kayitli = interaction.options.getRole("kayitli_rol");

                // Rol sıralaması kontrolü
                if (kayitsiz.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({ 
                        content: "❌ Kayıtsız rolü benim en yüksek rolümden daha yüksekte! Lütfen rolümü bu rolün üzerine taşı.", 
                        ephemeral: true 
                    });
                }
                
                if (kayitli.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({ 
                        content: "❌ Kayıtlı rolü benim en yüksek rolümden daha yüksekte! Lütfen rolümü bu rolün üzerine taşı.", 
                        ephemeral: true 
                    });
                }

                await db.set(`kayit_roller_${guildId}`, {
                    kayitsizRol: kayitsiz.id,
                    kayitliRol: kayitli.id
                });

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle("✅ Kayıt Rolleri Ayarlan")
                    .setDescription("Kayıt sistemi rolleri başarıyla ayarlandı!")
                    .addFields(
                        { name: "📌 Kayıtsız Rol", value: `${kayitsiz}`, inline: true },
                        { name: "✅ Kayıtlı Rol", value: `${kayitli}`, inline: true }
                    )
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // 2. KUR - Panel kur
            if (altKomut === "kur") {
                await interaction.deferReply({ ephemeral: true });
                
                // Ayarları kontrol et
                const ayarlar = await db.get(`kayit_roller_${guildId}`);
                if (!ayarlar) {
                    return interaction.editReply("❌ Önce `/kayit-sistemi ayarla` komutu ile rolleri ayarlamalısın!");
                }

                // Rollerin hala var olduğunu kontrol et
                const kayitsizRol = interaction.guild.roles.cache.get(ayarlar.kayitsizRol);
                const kayitliRol = interaction.guild.roles.cache.get(ayarlar.kayitliRol);

                if (!kayitsizRol) {
                    return interaction.editReply("❌ Kayıtsız rolü silinmiş! Lütfen rolleri yeniden ayarla.");
                }
                if (!kayitliRol) {
                    return interaction.editReply("❌ Kayıtlı rolü silinmiş! Lütfen rolleri yeniden ayarla.");
                }

                const kanal = interaction.options.getChannel("kanal") || interaction.channel;
                
                // Kanal tipi kontrolü
                if (!kanal.isTextBased()) {
                    return interaction.editReply("❌ Sadece yazı kanallarına panel kurabilirim!");
                }

                const embed = new EmbedBuilder()
                    .setTitle("🎭 Sunucu Kayıt Sistemi")
                    .setDescription(
                        "Sunucumuza hoş geldin! Aramıza katılmak için aşağıdaki **Kayıt Ol** butonuna tıklaman yeterli.\n\n" +
                        "✅ Butona tıkladıktan sonra otomatik olarak kayıt olacaksın."
                    )
                    .setColor(0x5865F2)
                    .setThumbnail(interaction.guild.iconURL())
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("kayit_ol_buton")
                        .setLabel("📝 Kayıt Ol")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("✅")
                );

                const mesaj = await kanal.send({ embeds: [embed], components: [row] });

                // Paneli kaydet
                await db.set(`kayit_panel_${mesaj.id}_${guildId}`, {
                    kayitsizRolId: ayarlar.kayitsizRol,
                    kayitliRolId: ayarlar.kayitliRol,
                    kurulumTarihi: Date.now(),
                    kuranKisi: interaction.user.id
                });

                const basariEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle("✅ Kayıt Paneli Kuruldu!")
                    .setDescription(`Panel başarıyla ${kanal} kanalına kuruldu.`)
                    .addFields(
                        { name: "📌 Kanal", value: `${kanal}`, inline: true },
                        { name: "🎭 Kayıtsız Rol", value: `${kayitsizRol}`, inline: true },
                        { name: "✅ Kayıtlı Rol", value: `${kayitliRol}`, inline: true }
                    )
                    .setTimestamp();

                return interaction.editReply({ embeds: [basariEmbed] });
            }

            // 3. SIFIRLA - Sistemi sıfırla
            if (altKomut === "sifirla") {
                await db.delete(`kayit_roller_${guildId}`);
                
                // Tüm panelleri de temizle (opsiyonel)
                const allKeys = await db.all();
                const panelKeys = allKeys.filter(item => 
                    item.id && item.id.startsWith(`kayit_panel_`) && item.id.endsWith(`_${guildId}`)
                );
                
                for (const key of panelKeys) {
                    await db.delete(key.id);
                }

                return interaction.reply({ 
                    content: "✅ Kayıt sistemi başarıyla sıfırlandı! Tüm ayarlar ve paneller temizlendi.", 
                    ephemeral: true 
                });
            }

        } catch (error) {
            console.error("❌ Kayıt sistemi hatası:", error);
            
            if (interaction.deferred) {
                return interaction.editReply({ content: "❌ Bir hata oluştu! Lütfen daha sonra tekrar dene." });
            } else {
                return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
            }
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("kayit-sistemi")
    .setDescription("📝 Butonlu kayıt sistemini yönet")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
        subcommand
            .setName("ayarla")
            .setDescription("Kayıt sisteminde kullanılacak rolleri ayarla")
            .addRoleOption(option =>
                option.setName("kayitsiz_rol")
                    .setDescription("Kayıt olmamış üyelere verilecek rol")
                    .setRequired(true))
            .addRoleOption(option =>
                option.setName("kayitli_rol")
                    .setDescription("Kayıt olan üyelere verilecek rol")
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName("kur")
            .setDescription("Kayıt panelini kur")
            .addChannelOption(option =>
                option.setName("kanal")
                    .setDescription("Panelin kurulacağı kanal (varsayılan: bu kanal)")
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName("sifirla")
            .setDescription("Kayıt sistemini sıfırla"));