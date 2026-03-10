const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Controllo se hai scritto un messaggio
    if (!text) return m.reply(`❌ Errore: Scrivi un messaggio!\nEsempio: ${usedPrefix}${command} Attenzione a tutti!`);

    // 2. Recupero tutti i gruppi (Gid)
    const groups = Object.entries(conn.chats)
        .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats)
        .map(([jid]) => jid);

    m.reply(`🚀 Invio globale in corso su ${groups.length} gruppi...`);

    // 3. Ciclo di invio con ritardo
    for (let id of groups) {
        try {
            const groupMetadata = await conn.groupMetadata(id);
            const participants = groupMetadata.participants.map(p => p.id);
            
            await conn.sendMessage(id, { 
                text: `📢 *ANNUNCIO GLOBALE*\n\n${text}`, 
                mentions: participants 
            });

            // Aspetta 3 secondi per evitare il ban
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
            console.error(`Errore nel gruppo ${id}:`, e);
        }
    }

    m.reply('✅ Operazione completata!');
};

handler.help = ['globaltag'];
handler.tags = ['owner']; // O la categoria che preferisci
handler.command = /^(globaltag)$/i;
handler.owner = true; // Solo tu puoi usarlo, per sicurezza

export default handler;
