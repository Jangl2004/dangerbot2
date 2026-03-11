// TOP TIME // Plugin creato da Luxifer
const TZ = "Europe/Rome"

let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, "Questo comando funziona solo nei gruppi.", m)

  const today = getTodayKey()
  initDay(today)

  const chatData = global.db.data.toptimeDaily.days[today].chats[m.chat] || {}
  const top = getTopTime5(chatData)

  if (top.length === 0) return conn.reply(m.chat, "Nessun dato temporale registrato oggi.", m)

  const { text, mentions } = formatTopTimeText(top, today)

  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message || m.isBaileys || m.fromMe || !m.isGroup) return

    const today = getTodayKey()
    initDay(today)

    const dayObj = global.db.data.toptimeDaily.days[today]
    if (!dayObj.chats[m.chat]) dayObj.chats[m.chat] = {}
    const chatData = dayObj.chats[m.chat]

    const now = Date.now()
    const lastActive = chatData[m.sender]?.lastSeen || now
    const diff = Math.min(now - lastActive, 300000) // Limite: max 5 minuti per messaggio per evitare glitch

    chatData[m.sender] = {
      time: (chatData[m.sender]?.time || 0) + (diff > 0 ? diff : 0),
      lastSeen: now
    }

  } catch (e) {
    console.error("Errore toptime.before:", e)
  }
}

function initDay(today) {
  if (!global.db.data.toptimeDaily) global.db.data.toptimeDaily = { days: {} }
  if (!global.db.data.toptimeDaily.days[today]) {
    global.db.data.toptimeDaily.days[today] = { chats: {} }
  }
}

function getTopTime5(chatData) {
  return Object.entries(chatData)
    .sort((a, b) => b[1].time - a[1].time)
    .slice(0, 5)
}

function formatTopTimeText(top, today) {
  const medals = ["🥇", "🥈", "🥉", "🏅", "🎖"]
  const mentions = top.map(([jid]) => jid)

  let text = `🏆 *TOP 5 ATTIVITÀ (TEMPO) OGGI*\n`
  text += `📅 ${today}\n\n`

  for (let i = 0; i < top.length; i++) {
    const [jid, data] = top[i]
    const num = jid.split("@")[0]
    const timeMs = data.time
    const h = Math.floor(timeMs / 3600000)
    const m = Math.floor((timeMs % 3600000) / 60000)
    
    text += `${medals[i]} @${num} — *${h}h ${m}m*\n`
  }

  return { text: text.trim(), mentions }
}

function getRomeNowParts() {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  }).formatToParts(new Date())
  const obj = {}
  for (const p of parts) if (p.type !== "literal") obj[p.type] = p.value
  return obj
}

function getTodayKey() {
  const p = getRomeNowParts()
  return `${p.year}-${p.month}-${p.day}`
}

handler.help = ["toptime"]
handler.tags = ["group"]
handler.command = /^(toptime)$/i
handler.group = true

export default handler
