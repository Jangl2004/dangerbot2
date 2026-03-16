// Plugin corretto per ES Module e Baileys
const handler = async (m, { conn, args, participants }) => {
    // Verifica se è in un gruppo
    if (!m.isGroup) return conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m);

    // Recupero amministratori
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participantsGroup = groupMetadata.participants;
    const admins = participantsGroup.filter(p => p.admin !== null).map(p => p.id);

    if (admins.length === 0) return conn.reply(m.chat, 'Nessun amministratore trovato.', m);

    // Formattazione del testo
    const text = args.join(" ") || "Richiesta assistenza admin";
    let mentionText = `🔔 *Richiesta Admin:*\n${text}\n\n`;
    
    for (let admin of admins) {
        mentionText += `@${admin.split('@')[0]} `;
    }

    // Invio finale
    await conn.sendMessage(m.chat, { 
        text: mentionText, 
        mentions: admins 
    }, { quoted: m });
};

handler.help = ['admins'];
handler.tags = ['group'];
handler.command = /^(admins)$/i;
handler.group = true;

export default handler;
