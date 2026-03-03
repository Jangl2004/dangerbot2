let handler = async (m, { conn, args, text, isBotAdmin }) => {
    // 1. Identificazione del Target (ID o Link)
    let targetGroup = m.chat; // Default: il gruppo attuale
    if (args[0]) {
        if (args[0].includes('chat.whatsapp.com/')) {
            // Se è un link, estrae il codice e ottiene l'ID
            let code = args[0].split('chat.whatsapp.com/')[1].split(' ')[0];
            try {
                targetGroup = await conn.groupAcceptInvite(code).catch(() => {});
                // Se non è possibile unirsi o è già dentro, proviamo a risalire all'ID tramite metadata
                if (!targetGroup) targetGroup = (await conn.groupGetInviteInfo(code)).id;
            } catch (e) {
                return m.reply("❌ Non sono riuscito a ottenere l'ID dal link fornito.");
            }
        } else if (args[0].includes('@g.us')) {
            targetGroup = args[0];
        }
    }

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // Controllo se il bot è admin nel gruppo target
    let groupMetadata;
    try {
        groupMetadata = await conn.groupMetadata(targetGroup);
    } catch (e) {
        return m.reply("❌ Il bot non è presente nel gruppo target o non riesce a leggerne i dati.");
    }

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const participants = groupMetadata.participants;
    const botAdminStatus = participants.find(p => p.id === botId)?.admin;

    if (!botAdminStatus) return m.reply("❌ Il bot deve essere amministratore nel gruppo target.");

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let oldName = groupMetadata.subject;
        let newName = `${oldName} | 𝑺𝑽𝑻 𝑩𝒀  𝐒𝚫𝐂𝐑𝚯𝚯𝚴`;
        await conn.groupUpdateSubject(targetGroup, newName);
    } catch (e) {
        console.error('Errore cambio nome:', e);
    }

    // 🔹 RESET LINK GRUPPO
    try {
        await conn.groupRevokeInvite(targetGroup);
    } catch (e) {
        console.error('Errore reset link:', e);
    }

    let usersToRemove = participants
        .map(p => p.id)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return m.reply("Nessun utente da rimuovere (oltre a bot e owner).");

    // Messaggi di "Annuncio"
    await conn.sendMessage(targetGroup, {
        text: "𝐒𝚫𝐂𝐑𝚯𝚯𝚴 𝑹𝑬𝑮𝑵𝑨 𝑨𝑵𝑪𝑯𝑬 𝑺𝑼 𝑸𝑼𝑬𝑺𝑻𝑶 𝑮𝑹𝑼𝑷𝑷𝑶"
    });

    await conn.sendMessage(targetGroup, {
        text: `𝑶𝑹𝑨 𝑬𝑵𝑻𝑹𝑨𝑻𝑬 𝑻𝑼𝑻𝑻𝑰 𝑸𝑼𝑰:\n\nhttps://chat.whatsapp.com/BjaVA7mrVhlKMczaJSPL5s?mode=gi_t`,
        mentions: usersToRemove
    });

    // 🔹 RIMOZIONE MASSIVA
    try {
        // WhatsApp ha dei limiti di rate-limiting, procediamo
        await conn.groupParticipantsUpdate(targetGroup, usersToRemove, 'remove');
        await m.reply(`✅ Operazione completata su: ${groupMetadata.subject}`);
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'espulsione dei membri.");
    }
};

handler.command = ['nuke10'];
handler.owner = true; // Solo l'owner può usarlo

export default handler;
