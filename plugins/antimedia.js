let handler = async () => {}

const DEFAULT = {
  enabled: false,
  delete: true,
  warn: true,
  allowAdmins: true,
}

function getCfg(chatId) {
  global._antimediaCfg = global._antimediaCfg || {}
  const mem = global._antimediaCfg

  mem[chatId] = mem[chatId] || { ...DEFAULT }
  return mem[chatId]
}

async function isAdmin(conn, chatId, jid) {
  try {
    const meta = await conn.groupMetadata(chatId)
    const user = meta.participants.find(p => p.id === jid)
    return !!user?.admin
  } catch {
    return false
  }
}

function isMedia(m) {
  const msg = m.message || {}

  return (
    msg.imageMessage ||
    msg.videoMessage ||
    msg.audioMessage ||
    msg.stickerMessage ||
    msg.documentMessage ||
    msg.viewOnceMessage ||
    msg.viewOnceMessageV2 ||
    msg.contactMessage ||
    msg.locationMessage
  )
}

//
// ===== ATTIVAZIONE CON .1 antimedia / .0 antimedia =====
//

handler.command = ["1", "0"]
handler.group = true
handler.admin = true
handler.tags = ["group"]
handler.help = ["1 antimedia", "0 antimedia"]

handler = Object.assign(handler, {
  async run(m, { conn, command, text }) {
    const chatId = m.chat
    const cfg = getCfg(chatId)

    if (!text.toLowerCase().includes("antimedia")) return

    if (command === "1") {
      cfg.enabled = true
      return conn.sendMessage(chatId, {
        text: "🛡️ Antimedia ATTIVATO"
      }, { quoted: m })
    }

    if (command === "0") {
      cfg.enabled = false
      return conn.sendMessage(chatId, {
        text: "❌ Antimedia DISATTIVATO"
      }, { quoted: m })
    }
  }
})

//
// ===== BLOCCO MEDIA =====
//

handler.before = async function (m, { conn }) {
  try {
    if (!m?.message) return
    if (!m.isGroup) return
    if (m.fromMe) return

    const chatId = m.chat
    const cfg = getCfg(chatId)
    if (!cfg.enabled) return

    if (!isMedia(m)) return

    // Se admin sono permessi
    if (cfg.allowAdmins) {
      const senderIsAdmin = await isAdmin(conn, chatId, m.sender)
      if (senderIsAdmin) return
    }

    // Il bot deve essere admin per eliminare
    const botIsAdmin = await isAdmin(conn, chatId, conn.user?.jid)
    if (!botIsAdmin) return

    await conn.sendMessage(chatId, { delete: m.key }).catch(() => {})

    if (cfg.warn) {
      await conn.sendMessage(chatId, {
        text: "🚫 Media non consentiti in questo gruppo."
      }, { quoted: m })
    }

  } catch (e) {
    console.error("Errore antimedia:", e)
  }
}

export default handler
