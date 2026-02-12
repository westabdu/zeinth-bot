import db from "../utils/database.js";
import check_commands from "../utils/bot/check_commands.js";

export default client => {
    client.once("ready", () => {
        console.log("✅ Bot hazır, komutlar kontrol ediliyor...");
        check_commands(client);
        console.log(`🤖 ${client.user.tag} aktif!`);

        try {
            const allData = db.all();
            let silinen = 0;
            allData.forEach(item => {
                if (item.id && item.id.startsWith('afk_')) {
                    db.delete(item.id);
                    silinen++;
                }
            });
            if (silinen > 0) console.log(`✅ ${silinen} AFK kaydı temizlendi.`);
        } catch (error) {
            console.log("ℹ️ AFK temizliği sırasında hata oluştu (önemli değil).");
        }
    });
};