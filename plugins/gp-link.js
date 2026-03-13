const handler = async (m, { conn }) => {
    let inviteCode = await conn.groupInviteCode(m.chat);
    let groupLink = 'https://chat.whatsapp.com/' + inviteCode;

    // Usiamo il blocco di codice per dare quell'aspetto "hacker/bot" che cercavi
    let caption = `
╔══════════════════════╗
   *CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔
╚══════════════════════╝

🔗 LINK DI ACCESSO:
${groupLink}

_Tieni premuto il link per copiarlo._
`.trim();

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
