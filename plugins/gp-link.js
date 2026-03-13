const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi.');

  // 1. Recupero info del gruppo
  const metadata = await conn.groupMetadata(m.chat);
  const groupName = metadata.subject;
  const participants = metadata.participants || [];
  
  const totalMembers = participants.length;
  const totalAdmins = participants.filter(p => p.admin).length;

  // 2. Recupero link d'invito
  let inviteCode;
  try {
    inviteCode = await conn.groupInviteCode(m.chat);
  } catch {
    return m.reply('⚠️ Errore: Il bot deve essere Amministratore per prendere il link.');
  }

  const groupLink = `https://chat.whatsapp.com/${inviteCode}`;

  // 3. Testo del messaggio
  const caption = `
*${groupName}*

👥 Membri: ${totalMembers}
🛡️ Admin: ${totalAdmins}
`.trim();

  // 4. Creazione del messaggio interattivo con bottone VERO di copia (cta_copy)
  const message = {
    viewOnce: true,
    text: caption,
    footer: 'Link System',
    nativeFlowMessage: {
      buttons: [
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📑 Copia Link",
            copy_code: groupLink
          })
        }
      ]
    }
  };

  // 5. Invio tramite relayMessage (necessario per i bottoni nativi)
  return await conn.relayMessage(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: message
      }
    }
  }, { quoted: m });
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = /^link$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
