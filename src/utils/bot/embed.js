import { EmbedBuilder } from "discord.js"

export default (description, colorInput = "ana", titleInput = null) => {
    
    // 🎨 Renk Kütüphanemiz (Buraya istediğin kadar ekle!)
    const renkler = {
        "ana": "5865F2",    // Zenith Mavi
        "kirmizi": "E74C3C", // Hata rengi
        "yesil": "2ECC71",   // Başarı rengi
        "sari": "F1C40F",    // Bekleme rengi
        "siyah": "2B2D31",   // Modern koyu
        "mitsubishi": "FF0000" // Senin özel rengin! :)
    };

    // Eğer girilen renk listede varsa onu al, yoksa direkt girilen kodu kullan
    const secilenRenk = renkler[colorInput] || colorInput;

    const response = new EmbedBuilder()
        .setDescription(description)
        .setColor(secilenRenk)
        
        // Sadece titleInput varsa ve boş değilse başlık ekle (Hatayı çözen kısım!)
    if (titleInput && titleInput.trim().length > 0) {
        response.setTitle(titleInput);
    }

    return response;
}