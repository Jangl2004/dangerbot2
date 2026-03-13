const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('☠️ Questo comando funziona solo nei gruppi.');

  // 1. Recupero dati gruppo
  const metadata = await conn.groupMetadata(m.chat);
  const totalAdmins = metadata.participants.filter(p => p.admin).length;
  const totalMembers = metadata.participants.length;
  
  // 2. Recupero link
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Il bot deve essere Admin.');
  }
  const groupLink = 'https://chat.whatsapp.com/' + inviteCode;

  // 3. Testo pulito ed estetico
  const caption = `
🔗 *LINK DEL GRUPPO*

👥 *Membri:* ${totalMembers}
🛡️ *Admin:* ${totalAdmins}

${groupLink}
`.trim();

  // 4. Invio messaggio semplice (massima compatibilità)
  await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
