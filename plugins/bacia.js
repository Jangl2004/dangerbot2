// Plugin: bacia (fun) — tag o reply + reazione 💋

let handler = async (m, { conn, command, usedPrefix }) => {
  try {
    // Prende target: prima tag, altrimenti reply
    let target =
      m.mentionedJid?.[0] ||
      m.msg?.contextInfo?.mentionedJid?.[0] ||
      m.quoted?.sender;

    if (!target) {
      return conn.sendMessage(
        m.chat,
        { text: `💋 Usa così: *${usedPrefix + command} @utente* oppure rispondi a un messaggio.` },
        { quoted: m }
      );
    }

    // Evita di baciarsi da soli (opzionale)
    if (target === m.sender) {
      await conn.sendMessage(m.chat, { react: { text: '😳', key: m.key } });
      return conn.sendMessage(
        m.chat,
        { text: `😳 @${m.sender.split('@')[0]} non puoi baciare te stesso... però ti voglio bene 🤍`, mentions: [m.sender] },
        { quoted: m }
      );
    }

    const senderName = m.pushName || "Qualcuno";
    const targetTag = `@${target.split('@')[0]}`;

    const frasi = [
      `😚 *SMACK!* ${senderName} ha baciato ${targetTag}`, 
      
    ];

    const frase = frasi[Math.floor(Math.random() * frasi.length)];

    // Reazione al comando
    await conn.sendMessage(m.chat, { react: { text: '💋', key: m.key } });

    // Messaggio con menzioni
    await conn.sendMessage(
      m.chat,
      {
        text: frase,
        mentions: [target],
      },
      { quoted: m }
    );
  } catch (e) {
    console.error('Errore plugin bacia:', e);
  }
};

handler.help = ['bacia @tag', 'bacia (in reply)'];
handler.tags = ['fun'];
handler.command = /^(bacia|kiss|bacino)$/i;

export default handler;
