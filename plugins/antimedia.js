let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return

  const chatId = m.chat
  global._antimedia = global._antimedia || {}
  if (!global._antimedia[chatId])
    global._antimedia[chatId] = { enabled: false }

  const cfg = global._antimedia[chatId]

  if (!args[0]) {
    return conn.reply(
      chatId,
      `🛡️ Antimedia: *${cfg.enabled ? "ATTIVO ✅" : "DISATTIVO ❌"}*\n\nUso:\n.antimedia 1\n.antimedia 0`,
      m
    )
  }

  if (args[0] === "1") {
    cfg.enabled = true
    return conn.reply(chatId, "🛡️ Antimedia ATTIVATO ✅", m)
  }

  if (args[0] === "0") {
    cfg.enabled = false
    return conn.reply(chatId, "🛡️ Antimedia DISATTIVATO ❌", m)
  }

  conn.reply(chatId, "Uso corretto: .antimedia 1 oppure .antimedia 0", m)
}

handler.command = ["antimedia"]
handler.group = true
handler.admin = true
handler.tags = ["group"]
handler.help = ["antimedia 1/0"]

// ===== BLOCCO MEDIA =====

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.message || m.fromMe) return

  const chatId = m.chat
  if (!global._antimedia?.[chatId]?.enabled) return

  const msg = m.message

  const isMedia =
    msg.imageMessage ||
    msg.videoMessage ||
    msg.audioMessage ||
    msg.stickerMessage ||
    msg.documentMessage ||
    msg.viewOnceMessage ||
    msg.viewOnceMessageV2

  if (!isMedia) return

  try {
    await conn.sendMessage(chatId, { delete: m.key })
    await conn.reply(chatId, "🚫 Media non consentiti in questo gruppo.", m)
  } catch {}
}

export default handler
