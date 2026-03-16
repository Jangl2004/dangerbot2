const TZ = "Europe/Rome"

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, "Questo comando funziona solo nei gruppi.", m)

  const today = getTodayKey()
  initDay(today)

  const chatData = global.db.data.topchatDaily.days[today].chats[m.chat] || {}

  // Se l'utente NON ha premuto un bottone (quindi args è vuoto)
  if (!args[0]) {
    const sections = [
      {
        title: "Scegli la Classifica",
        rows: [
          { title: "Top 5", rowId: ".top 5", description: "Visualizza i primi 5 utenti più attivi" },
          { title: "Top 10", rowId: ".top 10", description: "Visualizza i primi 10 utenti più attivi" }
        ]
      }
    ]

    const listMessage = {
      text: "📊 *Classifica Attività*\n\nSeleziona quanti utenti vuoi visualizzare nella lista di oggi:",
      footer: "Plugin by Luxifer",
      title: "MENU TOP",
      buttonText: "Scegli qui",
      sections
    }

    // Invio come lista (più pulito) o bottoni standard
    return await conn.sendMessage(m.chat, listMessage, { quoted: m })
  }

  // Se l'utente HA premuto un bottone (args[0] sarà '5' o '10')
  let limit = parseInt(args[0])
  if (isNaN(limit)) limit = 5 // Fallback di sicurezza

  const top = getTop(chatData, limit)

  if (top.length === 0) return conn.reply(m.chat, "Nessun messaggio registrato oggi.", m)

  const { text, mentions } = formatTopText(top, today, limit)

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
        const top = getTop(chatData, 5) 
        if (top.length > 0) {
          const { text, mentions } = formatTopText(top, today, 5, true)
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

function getTop(chatData, limit) {
  return Object.entries(chatData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function formatTopText(top, today, limit, isAuto = false) {
  const medals = ["🥇", "🥈", "🥉", "🏅", "🎖", "👤", "👤", "👤", "👤", "👤"]
  const mentions = top.map(([jid]) => jid)

  let text = `${isAuto ? "⏰ *TOP 5 DI OGGI (AUTOMATICO)*" : `🏆 *TOP ${limit} DI OGGI*`}\n`
  text += `📅 ${today}\n\n`

  for (let i = 0; i < top.length; i++) {
    const [jid, count] = top[i]
    const num = jid.split("@")[0]
    const icon = medals[i] || "👤"
    text += `${icon} @${
