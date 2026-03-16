// TOP // Plugin creato da Luxifer - Versione con Top 3 + Bottoni

const TZ = "Europe/Rome"

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, "Questo comando funziona solo nei gruppi.", m)

  const today = getTodayKey()
  initDay(today)

  const chatData = global.db.data.topchatDaily.days[today].chats[m.chat] || {}
  
  // Se l'utente clicca un bottone (es: .top 5 o .top 10)
  if (args[0] === '5' || args[0] === '10') {
    let limit = parseInt(args[0])
    const top = getTopLimit(chatData, limit)
    if (top.length === 0) return conn.reply(m.chat, "Nessun messaggio registrato.", m)
    const { text, mentions } = formatTopText(top, today, limit)
    return await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
  }

  // Altrimenti, di default mostra la TOP 3 con i BOTTONI sotto
  const top3 = getTopLimit(chatData, 3)
  if (top3.length === 0) return conn.reply(m.chat, "Nessun messaggio registrato oggi.", m)

  const { text: top3Text, mentions } = formatTopText(top3, today, 3)

  const buttons = [
    { buttonId: '.top 5', buttonText: { displayText: '🏆 Visualizza Top 5' }, type: 1 },
    { buttonId: '.top 10', buttonText: { displayText: '🏅 Visualizza Top 10' }, type: 1 }
  ]

  const buttonMessage = {
    text: top3Text,
    footer: "Seleziona un bottone per espandere la classifica",
    mentions: mentions,
    buttons: buttons,
    headerType: 1
  }

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
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

function getTopLimit(chatData, limit) {
  return Object.entries(chatData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function formatTopText(top, today, limit, isAuto = false) {
  const medals = ["🥇", "
