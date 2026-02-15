import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "play",
    description: "Müzik çalar (Ara veya URL ver)",
    
    async execute(interaction, client) {
        const query = interaction.options.getString("sarki");
        const searchType = interaction.options.getString("kaynak") || "auto";
        const voiceChannel = interaction.member.voice.channel;
        
        if (!voiceChannel) {
            return interaction.reply({ 
                content: "❌ Bir ses kanalında olmalısın!", 
                ephemeral: true 
            });
        }

        // Botun ses kanalına bağlanma izni var mı?
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has("Connect") || !permissions.has("Speak")) {
            return interaction.reply({
                content: "❌ Ses kanalına bağlanma veya konuşma iznim yok!",
                ephemeral: true
            });
        }
        
        await interaction.deferReply();
        
        try {
            // Kaynak seçeneğine göre ara
            let searchQuery = query;
            
            if (searchType === "youtube") {
                // YouTube'da ara (sonuçları listele)
                const results = await client.distube.search(query, { 
                    limit: 5,
                    type: "video" 
                });
                
                if (results.length === 0) {
                    return interaction.editReply("❌ Sonuç bulunamadı!");
                }
                
                // Sonuçları göster ve kullanıcıya seçtir
                const embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle("🔍 YouTube Arama Sonuçları")
                    .setDescription(
                        results.map((song, i) => 
                            `**${i+1}.** ${song.name} - \`${song.formattedDuration}\``
                        ).join("\n")
                    )
                    .setFooter({ text: "1-5 arası bir sayı yazarak seçim yapabilirsin." });
                
                await interaction.editReply({ embeds: [embed] });
                
                // Kullanıcıdan seçim bekle (5 saniye)
                const filter = m => m.author.id === interaction.user.id && /^[1-5]$/.test(m.content);
                const collector = interaction.channel.createMessageCollector({ 
                    filter, 
                    max: 1,
                    time: 10000 
                });
                
                collector.on('collect', async message => {
                    const choice = parseInt(message.content) - 1;
                    const selectedSong = results[choice];
                    
                    await interaction.followUp(`✅ **${selectedSong.name}** seçildi, ekleniyor...`);
                    
                    // Seçilen şarkıyı çal
                    await client.distube.play(voiceChannel, selectedSong.url, {
                        textChannel: interaction.channel,
                        member: interaction.member,
                    });
                });
                
                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.followUp("⏰ Süre doldu! Tekrar dene.");
                    }
                });
                
                return;
            }
            
            // Normal çalma (URL veya direkt arama)
            await client.distube.play(voiceChannel, query, {
                textChannel: interaction.channel,
                member: interaction.member,
            });
            
            // Arama yapılıyorsa daha bilgilendirici mesaj
            if (!query.startsWith("http")) {
                await interaction.editReply({ 
                    content: `🔍 **${query}** YouTube/Spotify'da aranıyor...` 
                });
            } else {
                await interaction.editReply({ 
                    content: `✅ Şarkı sıraya ekleniyor...` 
                });
            }
            
        } catch (error) {
            console.error("❌ Play hatası:", error);
            
            // Hata mesajını kullanıcı dostu yap
            let errorMessage = "❌ Müzik çalınırken bir hata oluştu!";
            
            if (error.message.includes("No video id found")) {
                errorMessage = "❌ Geçersiz YouTube linki!";
            } else if (error.message.includes("copyright")) {
                errorMessage = "❌ Bu şarkı telif hakları nedeniyle çalınamıyor!";
            } else if (error.message.includes("private")) {
                errorMessage = "❌ Bu video gizli veya özel!";
            }
            
            await interaction.editReply({ content: errorMessage });
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Müzik çalar (Ara veya URL ver)")
    .addStringOption(option =>
        option.setName("sarki")
            .setDescription("Şarkı adı, YouTube linki veya Spotify linki")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("kaynak")
            .setDescription("Arama kaynağı (opsiyonel)")
            .setRequired(false)
            .addChoices(
                { name: "🌐 Otomatik (Önerilen)", value: "auto" },
                { name: "▶️ YouTube", value: "youtube" },
                { name: "🎵 Spotify", value: "spotify" },
                { name: "🎤 SoundCloud", value: "soundcloud" }
            ));