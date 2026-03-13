const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return m.reply('☠️ Questo comando funziona solo nei gruppi.');

  // Metadata del gruppo
  const metadata = await conn.groupMetadata(m.chat);
  const participants = metadata.participants || [];
  const totalAdmins = participants.filter(p => p.admin).length;
  const totalMembers = participants.length;

  // Recupero link
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Assicurati che il bot sia Admin.');
  }
  const groupLink = 'https://chat.whatsapp.com/' + inviteCode;

  // Testo estetico
  const textMsg = `
*CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔
━━━━━━━━━━━━━━
👥 *𝙈𝙚𝙢𝙗𝙧𝙞:* ${totalMembers}
🛡️ *𝘼𝙙𝙢𝙞𝙣:* ${totalAdmins}
🔗 *𝙇𝙞𝙣𝙠:* ${groupLink}
━━━━━━━━━━━━━━
_Tieni premuto sul link per copiarlo._
`.trim();

  // Invio con la struttura che hai confermato funzionante
  await conn.sendMessage(m.chat, {
    text: textMsg,
    footer: "🚀 𝘾𝙝𝙧𝙤𝙢𝙚 𝘽𝙤𝙩 𝙎𝙮𝙨𝙩𝙚𝙢",
    buttons: [
      { buttonId: "copy", buttonText: { displayText: "📑 𝘾𝙤𝙥𝙞𝙖 𝙇𝙞𝙣𝙠" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
