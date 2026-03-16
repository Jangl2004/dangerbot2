// TOP // Plugin creato da Luxifer - Fix Bottoni

const TZ = "Europe/Rome"

let handler = async (m, { conn, args, usedPrefix, command }) => {
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

  // DEFAULT: MOSTRA TOP 3 + BOTTONI
  const top3 = getTopLimit(chatData, 3)
  if (Object.keys(chatData).length === 0) return conn.reply(m.chat, "Nessun messaggio registrato oggi.", m)

  const { text: top3Text, mentions } = formatTopText(top3, today, 3)

  // Costruzione Bottoni compatibile
  const buttons = [
    { buttonId: `${usedPrefix + command} 5`, buttonText: { displayText: 'Visualizza Top 5' }, type: 1 },
    { buttonId: `${usedPrefix + command} 10`, buttonText: { displayText: 'Visualizza Top 10' }, type: 1 }
  ]

  const buttonMessage = {
    text: top3Text,
    footer: "Seleziona per espandere",
    buttons: buttons,
    headerType: 1,
    mentions: mentions
  }

  try {
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  } catch (e) {
    // Se i bottoni falliscono ancora, invia testo semplice con istruzioni
    console.error("Errore invio bottoni:", e)
    await conn.reply(m.chat, `${top3Text}\n\n*Usa:* \n.top 5 per la Top 5\n.top 10 per la Top 10`, m, { mentions })
  }
}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message || m.isBaileys || m.fromMe || !m.isGroup) return
    const today = getTodayKey()
    initDay(today)
    const dayObj = global.db.data.topchatDaily.days[today]
    if (!dayObj.chats[m.chat]) dayObj.chats[m.chat] = {}
    dayObj.chats[m.chat][m.sender] = (dayObj.chats[m.chat][m.sender] || 0) + 1

    if (isNow2359()) {
      if (!dayObj.sent[m.chat]) {
        const top = getTopLimit(dayObj.chats[m.chat], 5)
        if (top.length > 0) {
          const { text, mentions } = formatTopText(top, today, 5, true)
          await conn.sendMessage(m.chat, { text, mentions })
        }
        dayObj.sent[m.chat] = true
      }
    }
  } catch (e) {}
}

function initDay(today) {
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.topchatDaily) global.db.data.topchatDaily = { days: {} }
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
  const medals = ["🥇", "🥈", "🥉", "🏅", "🎖", "👤", "👤", "👤", "👤", "👤"]
  const mentions = top.map(([jid]) => jid)
  let text = `🏆 *TOP ${limit} ATTIVITÀ OGGI*\n📅 ${today}\n\n`
  if (isAuto) text = `⏰ *TOP 5 AUTOMATICA*\n📅 ${today}\n\n`

  for (let i = 0; i < top.length; i++) {
    const [jid, count] = top[i]
