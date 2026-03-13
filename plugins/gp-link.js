const handler = async (m, { conn }) => {
    let inviteCode = await conn.groupInviteCode(m.chat);
    let groupLink = 'https://chat.whatsapp.com/' + inviteCode;

    const templateMessage = {
        text: `*CHЯΘMΞ HΣΔRTS* ʳⁱˢⁱⁿᵍ ☪︎𐦔\n\nLink generato correttamente.`,
        contextInfo: {
            externalAdReply: {
                title: "CLICCA QUI PER COPIARE IL LINK",
                body: "Chrome Bot System",
                thumbnailUrl: "https://telegra.ph/file/a8523359d9976722e0e98.jpg", // Metti qui il tuo logo
                sourceUrl: groupLink,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    };

    await conn.sendMessage(m.chat, templateMessage, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
