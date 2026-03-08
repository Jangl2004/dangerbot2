async function handler(m, { isBotAdmin, text, conn }) {
  if (!isBotAdmin) {
    return await conn.sendMessage(m.chat, { text: 'ⓘ Devo essere admin per poter funzionare' }, { quoted: m });
  }

  // Correzione: prendiamo il JID solo se è una menzione o un messaggio citato
  let mention = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;

  if (!mention) {
    return await conn.sendMessage(m.chat, { text: 'ⓘ Menziona la persona da rimuovere o rispondi a un suo messaggio' }, { quoted: m });
  }

  // --- PROTEZIONE OWNER (Non banna nessuno della tua lista owner) ---
  const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
  if (ownerJids.includes(mention)) {
    return await conn.sendMessage(m.chat, { text: 'ⓘ Non posso rimuovere un Owner.' }, { quoted: m });
  }

  // --- ALTRI CONTROLLI DI SICUREZZA ---
  if (mention === conn.user.jid) return await conn.sendMessage(m.chat, { text: 'ⓘ Non puoi rimuovere il bot' }, { quoted: m });
  if (mention === m.sender) return await conn.sendMessage(m.chat, { text: 'ⓘ Non puoi rimuovere te stesso' }, { quoted: m });

  // Controllo permessi nel gruppo
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participant = groupMetadata.participants.find(u => u.id === mention);
  
  if (participant?.admin === 'admin' || participant?.admin === 'superadmin') {
    return await conn.sendMessage(m.chat, { text: "ⓘ Non posso rimuovere un admin." }, { quoted: m });
  }

  // --- ESECUZIONE ---
  const reason = text ? `\n\n𝐌𝐨𝐭𝐢𝐯𝐨: ${text.replace(/@\d+/g, '').trim()}` : '';

  await conn.sendMessage(m.chat, {
    text: `@${mention.split('@')[0]} è stato rimosso da @${m.sender.split('@')[0]}${reason}`,
    mentions: [mention, m.sender]
  }, { quoted: m });

  await conn.groupParticipantsUpdate(m.chat, [mention], 'remove');
}

handler.customPrefix = /kick|avadachedavra|kickdaanna|ciabbon|cicciona|pannolini|puffo/i;
handler.command = new RegExp();
handler.admin = true;

export default handler;
