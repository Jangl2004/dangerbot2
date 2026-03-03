/*
  =============================================================
  PLUGIN: nuke10.js (Solo Rimozione)
  UTILIZZO: .nuke10 <link_gruppo o ID_gruppo>
  DESCRIZIONE: Rimuove tutti i membri dal gruppo target.
               Richiede che il bot sia ADMIN nel gruppo target.
  =============================================================
*/

let handler = async (m, { conn, args, usedPrefix, isOwner }) => {
    
    if (!isOwner) return; 

    let input = args[0];
    if (!input) return m.reply(`Indica il link o l'ID del gruppo.\nEsempio: *${usedPrefix}nuke10 https://chat.whatsapp.com/xxxx*`);

    let groupJid = '';

    // 1. Estrazione ID
    if (input.includes('chat.whatsapp.com/')) {
        let code = input.split('chat.whatsapp.com/')[1].split(' ')[0];
        try {
            let info = await conn.groupGetInviteInfo(code);
            groupJid = info.id;
        } catch (e) {
            return m.reply("❌ Link non valido o bot non presente.");
        }
    } else {
        groupJid = input.endsWith('@g.us') ? input : input + '@g.us';
    }

    // 2. Controllo poteri e partecipanti
    let metadata;
    try {
        metadata = await conn.groupMetadata(groupJid);
    } catch (e) {
        return m.reply("❌ Errore: Il bot non può leggere i dati del gruppo.");
    }

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = metadata.participants.find(p => p.id === botId)?.admin;

    if (!isBotAdmin) {
        return m.reply("❌ Impossibile procedere: Il bot NON è amministratore nel gruppo target.");
    }

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    const participants = metadata.participants;

    // Filtra gli utenti da rimuovere (escludendo bot e owner)
    let usersToRemove = participants
        .map(p => p.id)
        .filter(jid => jid !== botId && !ownerJids.includes(jid));

    if (usersToRemove.length === 0) {
        return m.reply("⚠ Nessun utente da rimuovere (sono rimasti solo bot e owner).");
    }

    // 3. Esecuzione Rimozione Massiva
    await m.reply(`⚔️ *Inizio rimozione massiva su:* ${metadata.subject}\nUtenti da espellere: ${usersToRemove.length}`);

    try {
        await conn.groupParticipantsUpdate(groupJid, usersToRemove, 'remove');
        await m.reply(`✅ Pulizia completata. Tutti i membri sono stati rimossi.`);
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante la rimozione. WhatsApp potrebbe aver limitato l'azione.");
    }
};

handler.command = ['nuke10'];
handler.owner = true;

export default handler;
