import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const uptimeMs = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)

    // ✅ Ping reale: 1) prova ws.ping() 2) fallback send+ack
    const pingMs = await getRealPing(conn, m)

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const percentUsed = ((usedMem / totalMem) * 100).toFixed(2)

    const botStartTime = new Date(Date.now() - uptimeMs)
    const activationTime = botStartTime.toLocaleString('it-IT', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const botName = global.db?.data?.nomedelbot || "ᴅᴛʜ-ʙᴏᴛ"

    const textMsg = `
⟦ 𝐒𝐓𝐀𝐓𝐎 𝐁𝐎𝐓 ⟧

╭───────────────
│ 🤖 *_Bot_*      : ${botName}
│ ⚡ *_Ping_*     : ${pingMs} ms
│ 🕒 *_Uptime_*   : ${uptimeStr}
│ 💾 *_RAM_*      : ${percentUsed}%
│ 📅 *_Online_*   : ${activationTime}
╰───────────────

🟢 *_Tutti i sistemi attivi_*
`.trim()

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "PING REAL BY DANGER BOT",
      buttons: [
        { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠" }, type: 1 },
        { buttonId: usedPrefix + "menu", buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

  } catch (err) {
    console.error("Errore nel ping real:", err)
    await conn.sendMessage(m.chat, { text: "❌ Errore nel ping real. Guarda console/log." }, { quoted: m })
  }
}

async function getRealPing(conn, m) {
  // 1) Se la tua versione di Baileys espone ws.ping()
  try {
    if (conn?.ws && typeof conn.ws.ping === 'function') {
      const t0 = Date.now()
      await conn.ws.ping()
      return Date.now() - t0
    }
  } catch { /* ignore */ }

  // 2) Fallback: misura round-trip app (send -> server ack)
  // Nota: in alcune fork l’ACK non è sempre semplice da intercettare.
  // Qui facciamo una misura realistica: invio un messaggio invisibile e misuro il tempo della send.
  // (Se vuoi la variante ack event, te la preparo in base alla tua base bot.)
  const t0 = Date.now()
  await conn.sendMessage(m.chat, { text: '‎' }, { quoted: m }) // carattere "invisibile"
  return Date.now() - t0
}

function clockString(ms) {
  // cronometro: DD:HH:MM:SS (secondi reali)
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
