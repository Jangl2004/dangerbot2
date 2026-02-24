import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix, isAdmin, isOwner }) => {
  try {
    const user = global.db.data.users[m.sender] || {}

    // 🔐 Permessi: owner OR admin/mod OR premium
    if (!isOwner && !isAdmin && !user.premium) {
      return m.reply('⛔ *𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐫𝐢𝐬𝐞𝐫𝐯𝐚𝐭𝐨 𝐚𝐥𝐥𝐨 𝐒𝐓𝐀𝐅𝐅 / 𝐌𝐎𝐃 / 𝐏𝐑𝐄𝐌𝐈𝐔𝐌*')
    }

    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    // Calcolo ping
    const startTime = performance.now();
    const endTime = performance.now();
    const speed = (endTime - startTime).toFixed(4);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const percentUsed = ((usedMem / totalMem) * 100).toFixed(2);

    const totalMemGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);
    const usedMemGB = (usedMem / 1024 / 1024 / 1024).toFixed(2);

    const botName = global.db?.data?.nomedelbot || "ᴅᴛʜ-ʙᴏᴛ";

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

    const textMsg = `⟦ ⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 ⚡ ⟧
│
├─ 🕒 𝚄𝙿𝚃𝙸𝙼𝙴 : ${uptimeStr}
└─ ⚡ 𝙿𝙸𝙽𝙶   : ${speed} ms
`;

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "𝑷𝑰𝑵𝑮 𝑩𝒀 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓",
      buttons: [
        { buttonId: usedPrefix + "pingmod", buttonText: { displayText: "📡 Rifa il Ping" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m });

  } catch (err) {
    console.error("Errore nell'handler:", err);
    m.reply('❌ Errore durante l’esecuzione del comando.')
  }
};

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['pingmod'];
handler.tags = ['info'];
handler.command = /^(pingmod)$/i;
handler.group = false;
handler.premium = false;

export default handler;
