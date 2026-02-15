import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export const data = {
    name: "level-rol",
    description: "Belirli seviyeye ulaşınca verilecek rolleri ayarla",
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            const key = `level_roles_${guildId}`;
            let levelRoles = await db.get(key) || {};
            
            if (subcommand === "ekle") {
                const level = interaction.options.getInteger("seviye");
                const rol = interaction.options.getRole("rol");
                
                if (level < 1 || level > 1000) {
                    return interaction.reply({ content: "❌ Seviye 1-1000 arası olmalı!", ephemeral: true });
                }
                
                levelRoles[level] = rol.id;
                await db.set(key, levelRoles);
                
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle("✅ Seviye Rolü Eklendi")
                    .setDescription(`**Seviye ${level}** -> ${rol}`)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
                
            } else if (subcommand === "sil") {
                const level = interaction.options.getInteger("seviye");
                
                if (levelRoles[level]) {
                    delete levelRoles[level];
                    await db.set(key, levelRoles);
                    await interaction.reply({ content: `✅ Seviye **${level}** için rol ayarı kaldırıldı.`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `❌ Seviye **${level}** için ayarlanmış rol yok.`, ephemeral: true });
                }
                
            } else if (subcommand === "listele") {
                if (Object.keys(levelRoles).length === 0) {
                    return interaction.reply({ content: "📭 Henüz hiç seviye rolü ayarlanmamış.", ephemeral: true });
                }
                
                let desc = "";
                const sorted = Object.entries(levelRoles).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
                
                for (const [level, roleId] of sorted) {
                    const role = interaction.guild.roles.cache.get(roleId);
                    desc += `**Seviye ${level}** -> ${role || "@deleted-role"}\n`;
                }
                
                const embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle("🎭 Seviye Rolleri")
                    .setDescription(desc)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("❌ Level-rol komutu hatası:", error);
            return interaction.reply({ content: "❌ Bir hata oluştu!", ephemeral: true });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("level-rol")
    .setDescription("Seviye rolleri yönetimi")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName("ekle").setDescription("Seviye rolü ekle").addIntegerOption(opt => opt.setName("seviye").setDescription("Kaçıncı seviyede verilecek?").setRequired(true).setMinValue(1).setMaxValue(1000)).addRoleOption(opt => opt.setName("rol").setDescription("Verilecek rol").setRequired(true)))
    .addSubcommand(sub => sub.setName("sil").setDescription("Seviye rolü kaldır").addIntegerOption(opt => opt.setName("seviye").setDescription("Hangi seviyedeki rol kaldırılacak?").setRequired(true)))
    .addSubcommand(sub => sub.setName("listele").setDescription("Seviye rollerini listele"));