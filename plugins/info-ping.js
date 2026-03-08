let handler = async (m, { conn, usedPrefix }) => {
  // 1. Inviamo il messaggio segnaposto e prendiamo il riferimento (key)
  const start = Date.now();
  const { key } = await conn.sendMessage(m.chat, { text: '📡 *Ping in corso...*' });

  // 2. Calcoliamo la latenza reale basata sul round-trip
  const speed = Date.now() - start;
  const uptimeMs = process.uptime() * 1000;
  
  // 3. Prepariamo il testo finale con l'estetica desiderata
  const textMsg = `
⚡ *STATUS SISTEMA*
━━━━━━━━━━━━━━
📡 *Ping:* ${speed} ms
🕒 *Uptime:* ${clockString(uptimeMs)}
👑 *Owner:* LUXIFER
━━━━━━━━━━━━━━
`.trim();

  // 4. Modifichiamo il messaggio originale invece di inviarne uno nuovo o eliminarlo
  await conn.sendMessage(m.chat, {
    text: textMsg,
    edit: key,
    footer: "🚀 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐎𝐧𝐥𝐢𝐧𝐞",
    buttons: [
      { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠" }, type: 1 },
      { buttonId: usedPrefix + "menu", buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 }
    ],
    headerType: 1
  });
};

function clockString(ms) {
  let d = Math.floor(ms / 86400000);
  let h = Math.floor(ms / 3600000) % 24;
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping)$/i;

export default handler;
