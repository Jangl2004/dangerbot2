let handler = async (m, { conn, usedPrefix }) => {
  const start = Date.now();
  
  // 1. Inviamo il messaggio iniziale
  const sentMsg = await conn.sendMessage(m.chat, { text: '📡 *Ping in corso...*' }, { quoted: m });
  
  // 2. Calcoliamo la latenza
  const speed = Date.now() - start;
  const uptimeMs = process.uptime() * 1000;
  
  const textMsg = `
⚡ *STATUS SISTEMA*
━━━━━━━━━━━━━━
📡 *Ping:* ${speed} ms
🕒 *Uptime:* ${clockString(uptimeMs)}
👑 *Owner:* LUXIFER
━━━━━━━━━━━━━━
`.trim();

  // 3. Editiamo il messaggio precedente usando il suo ID (key)
  await conn.sendMessage(m.chat, {
    text: textMsg,
    edit: sentMsg.key,
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
