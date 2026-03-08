let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return;

    // Se non c'è testo, mostriamo la lista dei gruppi dove il bot è admin
    if (!text) {
        let groups = Object.entries(conn.chats)
            .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats)
            .map(([jid, chat]) => ({ jid, subject: chat.subject }));

        // Creazione dei bottoni/lista (Sintassi adattata)
        let buttons = groups.map(g => ({
            buttonId: `.nuke ${g.jid} ${m.text.split(' ').slice(1).join(' ')}`,
            buttonText: { displayText: g.subject },
            type: 1
        }));

        return await conn.sendMessage(m.chat, {
            text: "Seleziona il gruppo da nukkare:",
            buttons: buttons,
            headerType: 1
        });
    }

    // Parte della logica di Nuke
    let [groupJid, ...msgParts] = text.split(' ');
    let broadcastMsg = msgParts.join(' ');

    try {
        // 1. Reimposta il link per evitare rientri
        await conn.groupRevokeInvite(groupJid);
        
        // 2. Invia il messaggio di "addio" o reindirizzamento
        if (broadcastMsg) {
            await conn.sendMessage(groupJid, { text: broadcastMsg });
        }

        // 3. Logica di rimozione partecipanti
        let metadata = await conn.groupMetadata(groupJid);
        let participants = metadata.participants.filter(p => !p.admin && p.id !== conn.user.jid);
        
        let users = participants.map(u => u.id);
        await conn.groupParticipantsUpdate(groupJid, users, 'remove');
        
        m.reply("✅ Gruppo nukkato con successo.");
    } catch (e) {
        m.reply("❌ Errore: Assicurati che il bot sia admin.");
    }
};

handler.command = ['nuke'];
export default handler;
