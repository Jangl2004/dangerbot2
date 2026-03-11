const handler = async (m, { conn }) => {
    const chat = m.chat;
    if (!userStats[chat]) return m.reply("Nessun dato registrato ancora.");

    // Trasformiamo l'oggetto in array e ordiniamo
    let leaderboard = Object.keys(userStats[chat])
        .map(id => ({ id, time: userStats[chat][id].totalTime }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 10); // Prendiamo i primi 10

    let text = `🏆 *TOP 10 ATTIVITÀ GRUPPO* 🏆\n\n`;
    leaderboard.forEach((user, i) => {
        const seconds = Math.floor(user.time / 1000);
        const h = Math.floor(seconds / 3600);
        const m_ = Math.floor((seconds % 3600) / 60);
        
        const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
        text += `${emoji} ${i + 1}. @${user.id.split('@')[0]} : *${h}h ${m_}m*\n`;
    });

    await conn.sendMessage(chat, { text, mentions: leaderboard.map(u => u.id) }, { quoted: m });
};

handler.command = /^(timetop)$/i; 
export default handler;
