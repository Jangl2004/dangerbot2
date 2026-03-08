async function handler(m, { isBotAdmin, text, conn }) {
  // 1. Controllo Admin Bot
  if (!isBotAdmin) {
    return await conn.sendMessage(m.chat, { text: 'ⓘ Devo essere admin per poter funzionare' }, { quoted: m });
  }

  // 2. LOGICA SELEZIONE UTENTE: 
  // Ora prende l'utente SOLO se menzionato o citato ESPLICITAMENTE.
  // Se scrivi solo "kick" o "kickare" senza taggare nessuno, non farà nulla.
  let mention = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;

  if (!mention) {
    return await conn.sendMessage(m.chat, { text: 'ⓘ Devi menzionare un utente o rispondere a un suo messaggio per usare questo comando.' }, { quoted: m });
  }

  // 3. PROTEZIONE OWNER (Blindata)
  const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
  if (ownerJids.includes(mention)) {
    return await conn.sendMessage(m.chat, { text: 'ⓘ Non posso rimuovere un Owner.' }, { quoted: m });
  }

  // 4. CONTROLLI DI SICUREZZA
  if (mention === conn.user.jid) return await conn.sendMessage(m.chat, { text: 'ⓘ Non puoi rimuovere il bot' }, { quoted: m });
  if (mention === m.sender) return await conn.sendMessage(m.chat, { text: 'ⓘ Non puoi rimuovere te stesso' }, { quoted: m });

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participant = groupMetadata.participants.find(u => u.id === mention);
  
  if (participant?.admin === 'admin' || participant?.admin === 'superadmin') {
    return await conn.sendMessage(m.chat, { text: "ⓘ Non posso rimuovere un admin." }, { quoted: m });
  }

  // 5. ESECUZIONE
  await conn.groupParticipantsUpdate(m.chat, [mention], 'remove');
  
  await conn.sendMessage(m.chat, {
    text: `@${mention.split('@')[0]} è stato rimosso correttamente.`,
    mentions: [mention]
  }, { quoted: m });
}

// IL FILTRO: Risponde SOLO a questi comandi esatti.
// Se scrivi "kickare" o "banniamo", il bot NON farà nulla.
handler.customPrefix = /^(kick|avadachedavra|kickdaanna|ciabbon|cicciona|pannolini|puffo)$/i
handler.command = new RegExp
handler.admin = true
handler.group = true // Assicura che funzioni solo nei gruppi

export default handler;
