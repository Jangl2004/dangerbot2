const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return m.reply('☠️ Questo comando funziona solo nei gruppi.');

  const metadata = await conn.groupMetadata(m.chat);
  const totalAdmins = metadata.participants.filter(p => p.admin).length;
  const totalMembers = metadata.participants.length;

  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Il bot deve essere Admin.');
  }
  const groupLink = 'https://chat.whatsapp.com/' + inviteCode;

  const textMsg = `
*CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔
━━━━━━━━━━━━━━
👥 *𝙈𝙚𝙢𝙗𝙧𝙞:* ${totalMembers}
🛡️ *𝘼𝙙𝙢𝙞𝙣:* ${totalAdmins}
━━━━━━━━━━━━━━
_Premi il tasto sotto per avere il link._
`.trim();

  // Usiamo ESATTAMENTE la struttura del tuo plugin ping
  await conn.sendMessage(m.chat, {
    text: textMsg,
    footer: "🚀 𝘾𝙝𝙧𝙤𝙢𝙚 𝘽𝙤𝙩 𝙎𝙮𝙨𝙩𝙚𝙢",
    buttons: [
      { buttonId: `.getlink ${groupLink}`, buttonText: { displayText: "🔗 𝙊𝙩𝙩𝙞𝙚𝙣𝙞 𝙇𝙞𝙣𝙠" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

// Questo handler gestisce il tasto "Ottieni Link"
const subHandler = async (m, { text }) => {
  if (!text) return;
  await m.reply(text); 
};
subHandler.command = /^getlink$/i;

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
