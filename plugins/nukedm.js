/*
  =============================================================
  PLUGIN: .nuke (Versione Diretta - No Bug)
  SINTASSI: .nuke <ID_GRUPPO> | <MESSAGGIO>
  ESEMPIO: .nuke 120363123456@g.us | Addio a tutti
  =============================================================
*/

let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return;

    // Split del testo per prendere ID e Messaggio
    let [target, ...msg] = text.split('|');
    if (!target || !msg.length) {
        return m.reply("⚠️ *Sintassi errata!*\nUsa: `.nuke ID_GRUPPO | MESSAGGIO`\n\n_Esempio: .nuke 12345@g.us | Ciao_");
    }

    let groupJid = target.trim();
    let nukeMessage = msg.join('|').trim();

    try {
        await m.reply(`🚀 *Inizio attacco su:* ${groupJid}`);

        // 1. Messaggio di avviso
        await conn.sendMessage(groupJid, { text: nukeMessage });

        // 2. Revoca Link
        await conn.groupRevokeInvite(groupJid).catch(() => {});

        // 3. Prendi partecipanti direttamente dai metadati live
        let res = await conn.groupMetadata(groupJid);
        let participants = res.participants.map(p => p.id);
        let botId = conn.user.jid.split(':')[0] + '@s.whatsapp.net';

        // Filtra: Togli il bot e gli owner
        let toRemove = participants.filter(p => 
            p !== botId && 
            !global.owner.some(o => o[0] + '@s.whatsapp.net' === p)
        );

        // 4. Esecuzione rimozione
        if (toRemove.length > 0) {
            await conn.groupParticipantsUpdate(groupJid, toRemove, 'remove');
            await m.reply(`💥 *Nuke completato.* Rimossi ${toRemove.length} utenti.`);
        } else {
            await m.reply("❌ Nessun utente rimovibile trovato.");
        }

    } catch (e) {
        await m.reply(`❌ *ERRORE:* Assicurati che l'ID sia corretto e che io sia admin.\n\n_Errore: ${e.message}_`);
    }
}

handler.command = /^(nuke)$/i;
handler.owner = true;

export default handler;
