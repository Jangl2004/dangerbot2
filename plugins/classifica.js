// Plugin Top Messaggi Giornalieri

let handler = async (m, { conn }) => {
  const today = getToday()

  if (!global.db.data.topchat) global.db.data.topchat = {}
  if (!global.db.data.topchat[today]) global.db.data.topchat[today] = {}

  const data = global.db.data.topchat[today]

  // Ordina classifica
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10

  if (sorted.length === 0) {
    return conn.reply(m.chat, "Nessun messaggio registrato oggi.", m)
  }

  let text = `🏆 *CLASSIFICA ATTIVITÀ OGGI*\n`
  text += `📅 ${today}\n\n`

  for (let i = 0; i < sorted.length; i++) {
    const [jid, count] = sorted[i]
    const user = conn.getName(jid)
    text += `${i + 1}. 👤 ${user} — ${count} messaggi\n`
  }

  conn.reply(m.chat, text.trim(), m)
}

// 👇 Questo conta automaticamente ogni messaggio
handler.before = async function (m) {
  if (!m.message) return
  if (m.isBaileys) return
  if (m.fromMe) return

  const today = getToday()

  if (!global.db.data.topchat) global.db.data.topchat = {}
  if (!global.db.data.topchat[today]) global.db.data.topchat[today] = {}

  const data = global.db.data.topchat[today]

  if (!data[m.sender]) data[m.sender] = 0
  data[m.sender] += 1
}

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
}

handler.help = ['top']
handler.tags = ['group']
handler.command = /^(top)$/i
handler.group = true

export default handler
