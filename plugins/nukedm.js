/*
  =============================================================
  PLUGIN: nuke10.js (Con messaggio personalizzato e reset link)
  UTILIZZO: .nuke <ID_gruppo> <Messaggio personalizzato>
  =============================================================
*/

let handler = async (m, { conn, args, isOwner }) => {
    
    if (!isOwner) return; 

    // Prendiamo l'ID/Link come primo argomento
    let input = args[0];
    // Prendiamo tutto il resto come messaggio
    let customMessage = args.slice(1).join(' '); 

    if (!input) return m.reply("❌ Indica l'ID o il link del gruppo.");
    if (!customMessage) return m.reply("⚠️ Devi inserire anche il messaggio da inviare prima del nuke!");

    let groupJid = '';

    // 1. Estrazione ID
    if (input.includes('chat.whatsapp.com/')) {
        let code = input.split('chat.whatsapp.com/')[1].split(' ')[0];
        try {
            let info = await conn.groupGetInviteInfo(code);
            groupJid = info.id;
        } catch (e) {
            return m.reply("❌ Link non valido.");
        }
    } else {
        groupJid = input.endsWith('@g.us') ? input : input + '@g.us';
    }

    // 2. Invia il messaggio personalizzato
    await conn.sendMessage(groupJid, { text: customMessage });

    // 3. Reimposta il link del gruppo
    try {
        await conn.groupRevokeInvite(groupJid);
        await m.reply("🔗 Link reimpostato.");
    } catch (e) {
        await m.reply("⚠️ Errore nel reset del link (il bot deve essere admin).");
    }

    // 4. Esecuzione Nuke
    try {
        let metadata = await conn.groupMetadata(groupJid);
        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
        
        let usersToRemove = metadata.participants
            .map(p => p.id)
            .filter(jid => jid !== botId && !ownerJids.includes(jid));

        if (usersToRemove.length === 0) return m.reply("⚠ Nessuno da rimuovere.");

        await conn.groupParticipantsUpdate(groupJid, usersToRemove, 'remove');
        await m.reply(`✅ Nuke completato dopo aver inviato: "${customMessage}"`);
    } catch (e) {
        await m.reply(`❌ Errore durante la rimozione dei membri.`);
    }
};

handler.command = ['nuke'];
handler.owner = true;

export default handler;
