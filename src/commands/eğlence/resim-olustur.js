import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = {
    name: "resim",
    description: "AI ile resim oluştur",
    
    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const prompt = interaction.options.getString("prompt");
            
            console.log(`🎨 Resim isteği: ${prompt}`);
            
            // GÜNCEL FLUX MODELLERİ (Şubat 2025)
            const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
            if (!REPLICATE_API_KEY) {
                throw new Error("REPLICATE_API_KEY .env dosyasında bulunamadı!");
            }
            
            // Flux Schnell - En hızlı, ücretsiz
            const modelVersion = "black-forest-labs/flux-schnell";
            
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${REPLICATE_API_KEY}`
                },
                body: JSON.stringify({
                    version: modelVersion,
                    input: {
                        prompt: prompt,
                        num_outputs: 1,
                        aspect_ratio: "1:1",
                        num_inference_steps: 4 // Schnell için yeterli
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Replicate Hatası: ${response.status}`, errorText);
                
                if (response.status === 401) throw new Error("API Key geçersiz!");
                if (response.status === 402) throw new Error("Kredi yetersiz!");
                if (response.status === 422) throw new Error("Model versiyonu geçersiz!");
                throw new Error(`Replicate Hatası: ${response.status}`);
            }

            const data = await response.json();
            
            await interaction.editReply("🖌️ Resim oluşturuluyor... (10-20 saniye sürebilir)");
            
            let result;
            const predictionId = data.id;
            let attempts = 0;
            const maxAttempts = 30;
            
            while (attempts < maxAttempts && !result) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                    headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` }
                });
                
                const statusData = await statusResponse.json();
                
                if (statusData.status === 'succeeded') {
                    result = statusData.output?.[0];
                    break;
                } else if (statusData.status === 'failed') {
                    throw new Error("Resim oluşturma başarısız oldu.");
                }
            }
            
            if (result) {
                const embed = new EmbedBuilder()
                    .setColor("#FF6B9D")
                    .setTitle("🎨 AI Resmin")
                    .setDescription(`**İstek:** ${prompt}`)
                    .setImage(result)
                    .setFooter({ text: `Flux Schnell | ${interaction.user.tag}` });
                
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply("⏳ Resim oluşturma zaman aşımına uğradı. Tekrar dene.");
            }
        } catch (error) {
            console.error("❌ Resim hatası:", error);
            await interaction.editReply(`❌ Resim oluşturulamadı: ${error.message}`);
        }
    }
};

export const slash_data = new SlashCommandBuilder()
    .setName("resim")
    .setDescription("AI ile resim oluştur")
    .addStringOption(option =>
        option.setName("prompt")
            .setDescription("Ne resmi oluşturmak istiyorsun?")
            .setRequired(true));