// Plugin fatto da dildo
import os from 'os';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    const speed = await getRealPing(conn);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const percentUsed = ((usedMem / totalMem) * 100).toFixed(2);

    const totalMemGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);
    const usedMemGB = (usedMem / 1024 / 1024 / 1024).toFixed(2);

    const botName = global.db?.data?.nomedelbot || "𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓";

    const botStartTime = new Date(Date.now() - uptimeMs);
    const activationTime = botStartTime.toLocaleString('it-IT', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const wsState = getWsState(conn);
    const cores = os.cpus()?.length || 0;
    const load = os.loadavg ? os.loadavg() : [0, 0, 0];
    const loadStr = `${load[0].toFixed(2)} / ${load[1].toFixed(2)} / ${load[2].toFixed(2)}`;
    const nodeVer = process.version;

 const textMsg =`
╔═══〔 ⚙️ PING BOT ⚙️ 〕═══╗
╭─❖ 「 📡 PERFORMANCE 」 ❖─╮
│ ⚡ Ping        : ${speed} ms
│ 🕒 Uptime      : ${uptimeStr}
╰───────────────╯
╭─❖ 「 📅 ATTIVAZIONE 」 ❖─╮
│ 🟢 Attivo : ${activationTime}
╰───────────────╯
╭─❖ 「 👑 OWNER 」 ❖─╮
│ LUXIFER
╰───────────╯
╚═══════════════╝
`.trim();

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "🚀 𝑻𝒖𝒕𝒕𝒊 𝒊 𝒔𝒊𝒔𝒕𝒆𝒎𝒊 𝒐𝒑𝒆𝒓𝒂𝒕𝒊𝒗𝒊 🚀",
      buttons: [
        { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠" }, type: 1 },
        { buttonId: usedPrefix + "menu", buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m });

  } catch (err) {
    console.error("Errore nell'handler:", err);
  }
};

async function getRealPing(conn) {
  try {
    // WebSocket ping (se disponibile)
    if (conn?.ws && typeof conn.ws.ping === 'function') {
      const t0 = Date.now();
      await conn.ws.ping();
      const ms = Date.now() - t0;
      return Number.isFinite(ms) ? ms.toString() : "0";
    }

    // Fallback "preciso" locale (non invia nulla): misura latenza event-loop
    // (Se ws.ping non esiste nella tua base)
    const t0 = Date.now();
    await new Promise((resolve) => setImmediate(resolve));
    const ms = Date.now() - t0;
    return `${ms}`;
  } catch {
    return "Errore";
  }
}

function getWsState(conn) {
  const rs = conn?.ws?.readyState;
  // standard ws readyState: 0 CONNECTING, 1 OPEN, 2 CLOSING, 3 CLOSED
  if (rs === 1) return "OPEN";
  if (rs === 0) return "CONNECTING";
  if (rs === 2) return "CLOSING";
  if (rs === 3) return "CLOSED";
  return "UNKNOWN";
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping)$/i;

export default handler;
