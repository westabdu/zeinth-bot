import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = {
    name: "rol-bilgi",
    description: "Sunucudaki rollerin açıklamalarını gönderir.",
    
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Bu komutu sadece yöneticiler kullanabilir!", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle("🔮 Zenith Krallığı Rütbe ve Mevkileri")
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: "👑 Hükümdarlık", value: 
                        "• **Kadim Usta:** Sunucunun yaratıcısı ve mutlak hakimi.\n" +
                        "• **Yüce Konsey:** Krallığın yasalarını koyan ve düzeni sağlayan adminler.\n" +
                        "• **Zindan Muhafızı:** Asayişi sağlayan, kural bozanları cezalandıran moderatörler.", 
                        inline: false 
                    },
                    { name: "✨ Seçkinler ve Elçiler", value: 
                        "• **Sunağın Koruyucusu:** Zenith sisteminin baş muhafızı.\n" +
                        "• **Hanedan Üyesi:** Sunucuya takviye (boost) yaparak gücümüze güç katan asiller.\n" +
                        "• **Zenith'in Elçileri:** Bizlere hizmet eden kutsal mekanizmalar (botlar).\n" +
                        "• **Gezgin:** Aramıza yeni katılan, keşif sürecindeki üyeler.", 
                        inline: false 
                    },
                    { name: "⚔️ Ruhun Yükselişi (Seviye Sistemi)", value: 
                        "• **Usta:** Bilgelikte zirveye ulaşmış efsaneler (100 LVL).\n" +
                        "• **Yüce Bilge:** Krallığın sırlarına vakıf olanlar (70 LVL).\n" +
                        "• **Muhafız:** Gücünü kanıtlamış sadık savaşçılar (40 LVL).\n" +
                        "• **Gözcü:** Yolun yarısını aşmış dikkatli takipçiler (20 LVL).", 
                        inline: false 
                    }
                )
                .setImage("https://i.ibb.co/tpGXxnCB/logo2.jpg")
                .setTimestamp();

            await interaction.channel.send({ embeds: [embed] });

            return interaction.reply({ 
                content: "✅ Rol bilgileri başarıyla iletildi!", 
                ephemeral: true 
            });
        } catch (error) {
            console.error("❌ Rol-bilgi komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("rol-bilgi")
    .setDescription("Sunucudaki rollerin açıklamalarını gönderir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);