const handler = async (m, { conn }) => {
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Il bot deve essere amministratore.');
  }

  const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

  const caption = `
*CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔

Il link del gruppo è stato generato.
Clicca sul bottone sotto per visualizzarlo.
`.trim();

  // Usiamo i Bottoni classici (molto più compatibili)
  await conn.sendMessage(m.chat, {
    text: caption,
    footer: 'Chrome Bot System',
    buttons: [
      { buttonId: 'link_info', buttonText: { displayText: '🔗 Mostra Link' }, type: 1 }
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
