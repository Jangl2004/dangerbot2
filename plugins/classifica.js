// TOP // Plugin creato da Luxifer 

const TZ = "Europe/Rome"

let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, "Questo comando funziona solo nei gruppi.", m)

  const today = getTodayKey()
  initDay(today)

  const chatData = global.db.data.topchatDaily.days[today].chats[m.chat] || {}
  const top = getTop5(chatData)

  if (top.length === 0) return conn.reply(m.chat, "Nessun messaggio registrato oggi.", m)

  const { text, mentions } = formatTopText(top, today, conn)

  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    const today = getTodayKey()
    initDay(today)

    // ✅ conta messaggi per chat e per utente
    const dayObj = global.db.data.topchatDaily.days[today]
    if (!dayObj.chats[m.chat]) dayObj.chats[m.chat] = {}
    const chatData = dayObj.chats[m.chat]

    chatData[m.sender] = (chatData[m.sender] || 0) + 1

    // ✅ invio automatico alle 23:59 (una sola volta al giorno per gruppo)
    if (isNow2359()) {
      if (!dayObj.sent[m.chat]) {
        const top = getTop5(chatData)
        if (top.length > 0) {
          const { text, mentions } = formatTopText(top, today, conn, true)
          await conn.sendMessage(m.chat, { text, mentions })
        }
        dayObj.sent[m.chat] = true
      }
    }
  } catch (e) {
    console.error("Errore top.before:", e)
  }
}

function initDay(today) {
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.topchatDaily) {
    global.db.data.topchatDaily = { days: {} }
  }
  if (!global.db.data.topchatDaily.days[today]) {
    global.db.data.topchatDaily.days[today] = { chats: {}, sent: {} }
  }
}

function getTop5(chatData) {
  return Object.entries(chatData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
}

function formatTopText(top, today, conn, isAuto = false) {
  const medals = ["🥇", "🥈", "🥉", "🏅", "🎖"]
  const mentions = top.map(([jid]) => jid)

  let text = `${isAuto ? "⏰ *TOP 5 DI OGGI (AUTOMATICO)*" : "🏆 *TOP 5 ATTIVITÀ OGGI*"}\n`
  text += `📅 ${today}\n\n`

  for (let i = 0; i < top.length; i++) {
    const [jid, count] = top[i]
    const num = jid.split("@")[0]
    // ✅ “sembra che tagga” -> @numero + mentions[]
    text += `${medals[i]} @${num} — ${count} messaggi\n`
  }

  text += `\n${isAuto ? "✅ Classifica inviata automaticamente alle 23:59." : ""}`.trimEnd()

  return { text: text.trim(), mentions }
}

// Ora locale Europe/Rome (senza librerie esterne)
function getRomeNowParts() {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date())

  const obj = {}
  for (const p of parts) if (p.type !== "literal") obj[p.type] = p.value
  return obj // {year, month, day, hour, minute, second}
}

function getTodayKey() {
  const p = getRomeNowParts()
  return `${p.year}-${p.month}-${p.day}`
}

function isNow2359() {
  const p = getRomeNowParts()
  return p.hour === "23" && p.minute === "59"
}

handler.help = ["top"]
handler.tags = ["group"]
handler.command = /^(top)$/i
handler.group = true

export default handler
