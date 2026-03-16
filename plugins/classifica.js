// TOP // Plugin creato da Luxifer 

const TZ = "Europe/Rome"

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, "Questo comando funziona solo nei gruppi.", m)

  const today = getTodayKey()
  initDay(today)

  const chatData = global.db.data.topchatDaily.days[today].chats[m.chat] || {}

  // Se non ci sono argomenti (es. scrivi solo .top), invia i bottoni
  if (!args[0]) {
    const buttons = [
      { buttonId: '.top 5', buttonText: { displayText: 'Top 5' }, type: 1 },
      { buttonId: '.top 10', buttonText: { displayText: 'Top 10' }, type: 1 }
    ]

    const buttonMessage = {
      text: "Scegli la classifica di oggi:",
      footer: "Plugin by Luxifer",
      buttons: buttons,
      headerType: 1
    }

    return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }

  // Gestione della scelta (5 o 10)
  let limit = args[0] === '10' ? 10 : 5
  const top = getTopLimit(chatData, limit)

  if (top.length === 0) return conn.reply(m.chat, "Nessun messaggio registrato oggi.", m)

  const { text, mentions } = formatTopText(top, today, conn, false, limit)

  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message || m.isBaileys || m.fromMe || !m.isGroup) return

    const today = getTodayKey()
    initDay(today)

    const dayObj = global.db.data.topchatDaily.days[today]
    if (!dayObj.chats[m.chat]) dayObj.chats[m.chat] = {}
    const chatData = dayObj.chats[m.chat]

    chatData[m.sender] = (chatData[m.sender] || 0) + 1

    if (isNow2359()) {
      if (!dayObj.sent[m.chat]) {
        const top = getTopLimit(chatData, 5)
        if (top.length > 0) {
          const { text, mentions } = formatTopText(top, today, conn, true, 5)
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

function getTopLimit(chatData, limit) {
  return Object.entries(chatData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function formatTopText(top, today, conn, isAuto = false, limit = 5) {
  const medals = ["🥇", "🥈", "🥉", "🏅", "🎖", "👤", "👤", "👤", "👤", "👤"]
  const mentions = top.map(([jid]) => jid)

  let text = `${isAuto ? "⏰ *TOP 5 DI OGGI (AUTOMATICO)*" : `🏆 *TOP ${limit} ATTIVITÀ OGGI*`}\n`
  text += `📅 ${today}\n\n`

  for (let i = 0; i < top.length; i++) {
    const [jid, count] = top[i]
    const num = jid.split("@")[0]
    text += `${medals[i] || "👤"} @${num} — ${count} messaggi\n`
  }

  text += `\n${isAuto ? "✅ Classifica inviata automaticamente alle 23:59." : ""}`.trimEnd()

  return { text: text.trim(), mentions }
}

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
  return obj
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
