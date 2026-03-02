let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return

  const chatId = m.chat
  global._antimedia = global._antimedia || {}
  if (!global._antimedia[chatId]) global._antimedia[chatId] = { enabled: false }

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

  return conn.reply(chatId, "Uso corretto: .antimedia 1 oppure .antimedia 0", m)
}

handler.command = ["antimedia"]
handler.group = true
handler.admin = true
handler.tags = ["group"]
handler.help = ["antimedia 1/0"]


global._antimediaWarnedUsers = global._antimediaWarnedUsers || {} // { [chatId]: Set(jid) }

function isViewOnce(msg) {
  return !!(msg.viewOnceMessage || msg.viewOnceMessageV2)
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.isGroup || !m.message || m.fromMe) return

    const chatId = m.chat
    if (!global._antimedia?.[chatId]?.enabled) return

    const msg = m.message

    

    const blockImageNormal = !!msg.imageMessage
    const blockVideoNormal = !!msg.videoMessage

    
    if (isViewOnce(msg)) return
    if (!blockImageNormal && !blockVideoNormal) return
    try {
      await conn.sendMessage(chatId, { delete: m.key })
    } catch {}

    
    global._antimediaWarnedUsers[chatId] = global._antimediaWarnedUsers[chatId] || new Set()
    const warnedSet = global._antimediaWarnedUsers[chatId]

    const sender = m.sender
    if (warnedSet.has(sender)) return

    warnedSet.add(sender)

    try {
      await conn.reply(
        chatId,
        " Siete pregati di non mandare foto o video se non sono a una visual. (antimedia attivo).",
        m
      )
    } catch {}
  } catch (e) {
    console.error("Errore antimedia:", e)
  }
}

export default handler
