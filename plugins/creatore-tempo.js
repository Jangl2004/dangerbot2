let handler = async (m, { conn }) => {
    // 1. Puntiamo allo stesso percorso del database di toptime
    const today = getTodayKey(); // Assicurati di avere questa funzione uguale a toptime
    if (!global.db.data.toptimeDaily?.days[today]?.chats[m.chat]?.[m.sender]) {
        return conn.reply(m.chat, "Nessun tempo registrato ancora.", m);
    }

    // 2. Leggiamo lo stesso valore che usa toptime
    const data = global.db.data.toptimeDaily.days[today].chats[m.chat][m.sender];
    const timeMs = data.time || 0;

    // 3. Formattazione
    const h = Math.floor(timeMs / 3600000);
    const m_ = Math.floor((timeMs % 3600000) / 60000);
    const s = Math.floor((timeMs % 60000) / 1000);

    let caption = `🕒 *Tempo Online Oggi*\n`;
    caption += `👤 @${m.sender.split('@')[0]}\n`;
    caption += `⏱️ *${h}h ${m_}m ${s}s*`;

    await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });
}

handler.command = /^(tempo)$/i;
export default handler;

// Inserisci qui le funzioni di supporto (getTodayKey, ecc.) 
// se non vengono importate automaticamente dal tuo bot.
