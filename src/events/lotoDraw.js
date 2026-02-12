import db from "../utils/database.js";
import { EmbedBuilder } from "discord.js";

export default function startLottoDraws(client) {
    setInterval(async () => {
        try {
            const allKeys = db.all();
            const guildIds = new Set();
            allKeys.forEach(item => {
                if (item.id?.startsWith("stats_")) {
                    const guildId = item.id.split('_')[1];
                    if (guildId) guildIds.add(guildId);
                }
            });

            for (const guildId of guildIds) {
                const poolKey = `lotto_${guildId}`;
                const pool = db.get(poolKey);
                if (!pool?.tickets?.length) continue;

                const winnerIndex = Math.floor(Math.random() * pool.tickets.length);
                const winner = pool.tickets[winnerIndex];
                const prize = pool.total || 0;
                if (prize <= 0) continue;

                const userKey = `stats_${guildId}_${winner.userId}`;
                let userData = db.get(userKey) || { cash: 0, total_earned: 0 };
                userData.cash += prize;
                userData.total_earned = (userData.total_earned || 0) + prize;
                db.set(userKey, userData);

                const guild = client.guilds.cache.get(guildId);
                if (guild) {
                    const channel = guild.channels.cache.find(ch => 
                        ch.name === "loto-log" || ch.name === "çekiliş" || ch.name === "genel"
                    );
                    if (channel?.isTextBased()) {
                        await channel.send({ embeds: [new EmbedBuilder()
                            .setColor(0xFFD700)
                            .setTitle("🎉 LOTO KAZANANI!")
                            .setDescription(`<@${winner.userId}> **${prize.toLocaleString()} ZenCoin** kazandı!`)
                            .setTimestamp()]
                        }).catch(() => {});
                    }
                }
                db.delete(poolKey);
            }
        } catch (error) {
            console.error("❌ Loto çekilişi hatası:", error);
        }
    }, 60 * 60 * 1000);
}