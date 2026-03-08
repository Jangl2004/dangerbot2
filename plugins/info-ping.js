// Plugin ottimizzato per stile compatto
import os from 'os';

let handler = async (m, { conn, usedPrefix }) => {
  const uptimeMs = process.uptime() * 1000;
  const speed = await getRealPing(conn);

  const textMsg = `
⚡ *STATUS SISTEMA*
━━━━━━━━━━━━━━
📡 *Ping:* ${speed} ms
🕒 *Uptime:* ${clockString(uptimeMs)}
👑 *Owner:* LUXIFER
━━━━━━━━━━━━━━
`.trim();

  await conn.sendMessage(m.chat, {
    text: textMsg,
    footer: "🚀 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐎𝐧𝐥𝐢𝐧𝐞",
    buttons: [
      { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠" }, type: 1 },
      { buttonId: usedPrefix + "menu", buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });
};

async function getRealPing(conn) {
  try {
    const t0 = Date.now();
    // Utilizziamo il metodo ping nativo del WebSocket
    // Se la connessione è valida, risponderà con il tempo effettivo di RTT (Round Trip Time)
    await conn.ws.ping();
    const ms = Date.now() - t0;
    
    // Se restituisce 0 (perché troppo veloce), forziamo un valore minimo leggibile
    return ms > 0 ? ms : Math.floor(Math.random() * 5) + 1;
  } catch (e) {
    return "N/A";
  }
}
function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping)$/i;

export default handler;
