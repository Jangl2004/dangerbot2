const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return m.reply('☠️ Questo comando funziona solo nei gruppi.');

  // Metadata del gruppo
  const metadata = await conn.groupMetadata(m.chat);
  const totalAdmins = metadata.participants.filter(p => p.admin).length;
  const totalMembers = metadata.participants.length;

  // Recupero link (lo usiamo per il bottone, non nel testo)
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Il bot deve essere Admin.');
  }
  const groupLink = 'https://chat.whatsapp.com/' + inviteCode;

  // Testo senza il link
  const textMsg = `
*CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔
━━━━━━━━━━━━━━
👥 *𝙈𝙚𝙢𝙗𝙧𝙞:* ${totalMembers}
🛡️ *𝘼𝙙𝙢𝙞𝙣:* ${totalAdmins}
━━━━━━━━━━━━━━
_Clicca il bottone sotto per ottenere il link._
`.trim();

  // Bottone che quando premuto invia il comando interno ".getlink"
  await conn.sendMessage(m.chat, {
    text: textMsg,
    footer: "🚀 𝘾𝙝𝙧𝙤𝙢𝙚 𝘽𝙤𝙩 𝙎𝙮𝙨𝙩𝙚𝙢",
    buttons: [
      { buttonId: `.getlink ${groupLink}`, buttonText: { displayText: "📑 𝘾𝙤𝙥𝙞𝙖 𝙇𝙞𝙣𝙠" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

// Questo piccolo handler serve per far apparire il link quando clicchi il bottone
const subHandler = async (m, { text }) => {
  if (!text) return;
  await m.reply(text); // Risponde col link in chiaro, così puoi copiarlo
};
subHandler.command = /^getlink$/i;

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
