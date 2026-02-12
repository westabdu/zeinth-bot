import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "uyar",
    description: "Kullanıcıya uyarı verir veya uyarılarını görürsünüz.",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: "❌ Bu komutu kullanmak için `Üyeleri Sustur` yetkisine sahip olmalısın!", ephemeral: true });
            }

            const sub = interaction.options.getSubcommand();
            const user = interaction.options.getUser('kullanici');
            const key = `warns_${interaction.guild.id}_${user.id}`;

            if (sub === "ekle") {
                const sebep = interaction.options.getString('sebep') || "Belirtilmedi";
                let warns = db.get(key) || [];
                warns.push({ 
                    sebep, 
                    admin: interaction.user.tag, 
                    tarih: new Date().toLocaleDateString('tr-TR') 
                });
                db.set(key, warns);
                return interaction.reply({ content: `✅ **${user.tag}** uyarıldı. (Toplam: ${warns.length})` });
            }

            if (sub === "bak") {
                let warns = db.get(key) || [];
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle(`📋 ${user.tag} Uyarıları`)
                    .setDescription(`${user.tag} kullanıcısının **${warns.length}** uyarısı var.`);
                
                warns.forEach((w, i) => {
                    embed.addFields({ 
                        name: `Uyarı #${i+1}`, 
                        value: `**Sebep:** ${w.sebep}\n**Yetkili:** ${w.admin}\n**Tarih:** ${w.tarih}`, 
                        inline: true 
                    });
                });
                
                return interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Uyar komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("uyar")
    .setDescription("Uyarı sistemi")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(s => 
        s.setName("ekle")
            .setDescription("Kullanıcıya yeni bir uyarı ekler.")
            .addUserOption(o => o.setName("kullanici")
                .setDescription("Uyarılacak kullanıcıyı seçin.")
                .setRequired(true))
            .addStringOption(o => o.setName("sebep")
                .setDescription("Uyarı sebebini belirtin.")
                .setRequired(false)))
    .addSubcommand(s => 
        s.setName("bak")
            .setDescription("Kullanıcının geçmiş uyarılarını listeler.")
            .addUserOption(o => o.setName("kullanici")
                .setDescription("Uyarılarına bakılacak kullanıcıyı seçin.")
                .setRequired(true)));