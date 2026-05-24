let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝙎𝙑𝙏 𝘽𝙔 𝚫𝚩𝐘𝐒𝐒`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    // 🔹 RESET LINK GRUPPO
    let newInviteLink = '';
    try {
        await conn.groupRevokeInvite(m.chat); // invalida il vecchio link
        let code = await conn.groupInviteCode(m.chat); // prende il nuovo codice
        newInviteLink = `https://chat.whatsapp.com/${code}`;
    } catch (e) {
        console.error('Errore reset link:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
        text: "𝚫𝚩𝐘𝐒𝐒 𝙍𝙀𝙂𝙉𝘼 𝘼𝙉𝘾𝙃𝙀 𝙎𝙐 𝙌𝙀𝙎𝙏𝙊 𝙂𝙍𝙐𝙋𝙋𝙊"
    });

    await conn.sendMessage(m.chat, {
        text: `𝙊𝙍𝘼 𝙀𝙉𝙏𝙍𝘼𝙏𝙀 𝙏𝙐𝙏𝙏𝙄 𝙌𝙐𝙄:\n\nhttps://chat.whatsapp.com/I7xUhuqFsC9FLd9ccTy38x?mode=gi_t`,
        mentions: allJids
        
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['abyss'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler
