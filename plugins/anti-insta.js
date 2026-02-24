let linkRegex = /(?:https?:\/\/|www\.)[^\s]*instagram[^\s]*|(?:^|\s)[^\s]*instagram[^\s]*\.(com|it|net|org|ru|me|co|io|tv)(?:\/[^\s]*)?/i;

export async function before(m, { isAdmin, isPrems, isBotAdmin, conn }) {
  if (m.isBaileys || m.fromMe) return true;
  if (!m.isGroup) return false;

  let chat = global.db.data.chats[m.chat];
  if (!chat) return false;

  let warnLimit = 3;
  let senderId = m.key.participant;
  let messageId = m.key.id;

  const isInstagramLink = linkRegex.exec(m.text);

  if (chat.antiInsta && isInstagramLink && !isAdmin && !isPrems && isBotAdmin) {

    global.db.data.users[m.sender] ??= {};
    global.db.data.users[m.sender].warn ??= 0;
    global.db.data.users[m.sender].warnReasons ??= [];

    global.db.data.users[m.sender].warn += 1;
    global.db.data.users[m.sender].warnReasons.push('link instagram');

    // Elimina il messaggio
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: messageId,
        participant: senderId,
      },
    });

    let warnCount = global.db.data.users[m.sender].warn;
    let remaining = warnLimit - warnCount;

    if (warnCount < warnLimit) {

      await conn.sendMessage(m.chat, {
        text: `╔═══━─━─━─━─━─━─━═══╗
   ⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • 𝐀𝐍𝐓𝐈𝐈𝐍𝐒𝐓𝐀
╚═══━─━─━─━─━─━─━═══╝
📡 LINK INSTAGRAM RILEVATO

⚠️ Avvertimento: ${warnCount}/${warnLimit}
🔹 Rimangono: ${remaining}

Prossima violazione → espulsione.
━━━━━━━━━━━━━━━━━━`
      });

    } else {

      global.db.data.users[m.sender].warn = 0;
      global.db.data.users[m.sender].warnReasons = [];

      await conn.sendMessage(m.chat, {
        text: `╔═══━─━─━─━─━─━─━═══╗
   ⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • 𝐏𝐔𝐍𝐈𝐙𝐈𝐎𝐍𝐄
╚═══━─━─━─━─━─━─━═══╝
💀 LIMITE SUPERATO

🔹 Utente rimosso dal Gruppo.
━━━━━━━━━━━━━━━━━━`
      });

      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    }
  }

  return true;
}
