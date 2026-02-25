import fs from 'fs'

const dbPath = './database.json'

// ============================
// DATABASE
// ============================

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {}, groups: {} }, null, 2))
  }

  let db = JSON.parse(fs.readFileSync(dbPath))

  if (!db.users) db.users = {}
  if (!db.groups) db.groups = {}

  return db
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

// ============================
// TRACKER MESSAGGI
// ============================

export async function before(m) {
  if (!m.isGroup) return

  let db = loadDB()

  // init user
  if (!db.users[m.sender]) {
    db.users[m.sender] = {
      todayMessages: 0,
      totalMessages: 0
    }
  }

  // init group
  if (!db.groups[m.chat]) {
    db.groups[m.chat] = {
      todayMessages: 0
    }
  }

  db.users[m.sender].todayMessages++
  db.users[m.sender].totalMessages++
  db.groups[m.chat].todayMessages++

  saveDB(db)
}

// ============================
// COMANDO TOP
// ============================

let handler = async (m, { conn, command, usedPrefix }) => {

  if (!m.isGroup)
    return m.reply('❌ Solo nei gruppi.')

  let db = loadDB()

  let groupData = db.groups[m.chat] || { todayMessages: 0 }

  let ranking = Object.entries(db.users)
    .map(([jid, data]) => [jid, data.todayMessages || 0])
    .filter(([_, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])

  if (!ranking.length)
    return m.reply('⚠️ Nessun messaggio oggi.')

  let userPosition = ranking.findIndex(([jid]) => jid === m.sender) + 1
  let totalGroupMessages = groupData.todayMessages || 0

  // =========================
  // 📊 STATS
  // =========================
  if (command === 'top') {

    let text =
`📊 *STATISTICHE DI OGGI*

💬 Messaggi totali gruppo: ${totalGroupMessages}
📍 Tua posizione: ${userPosition || 'Non classificato'}
🗣️ Tu oggi: ${db.users[m.sender].todayMessages}

🔥 Continua a scrivere per salire in classifica!`

    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🏆 Top 5",
          id: `${usedPrefix}top5`
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🔟 Top 10",
          id: `${usedPrefix}top10`
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🧹 Reset",
          id: `${usedPrefix}resetday`
        })
      }
    ]

    return await conn.sendMessage(m.chat, {
      text,
      footer: '📊 Classifica Giornaliera',
      interactiveButtons: buttons
    }, { quoted: m })
  }

  // =========================
  // 🏆 TOP 5
  // =========================
  if (command === 'top5') {

    let top5 = ranking.slice(0, 5)
    let medals = ['🥇','🥈','🥉','🏅','🏅']
    let mentions = []

    let text = '🏆 *TOP 5 DI OGGI*\n\n'

    top5.forEach(([jid, total], i) => {
      mentions.push(jid)
      text += `${medals[i]} @${jid.split('@')[0]}\n`
      text += `   💬 ${total} messaggi\n\n`
    })

    text += `📍 La tua posizione: ${userPosition || 'Non classificato'}`

    return conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
  }

  // =========================
  // 🔟 TOP 10
  // =========================
  if (command === 'top10') {

    let top10 = ranking.slice(0, 10)
    let mentions = []

    let text = '🔟 *TOP 10 DI OGGI*\n\n'

    top10.forEach(([jid, total], i) => {
      mentions.push(jid)
      text += `${i+1}° @${jid.split('@')[0]}\n`
      text += `   💬 ${total} messaggi\n\n`
    })

    text += `📍 La tua posizione: ${userPosition || 'Non classificato'}`

    return conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
  }

  // =========================
  // 🧹 RESET MANUALE
  // =========================
  if (command === 'resetday') {

    Object.keys(db.users).forEach(jid => {
      db.users[jid].todayMessages = 0
    })

    db.groups[m.chat].todayMessages = 0

    saveDB(db)

    return m.reply('🧹 Classifica giornaliera resettata!')
  }
}

handler.command = ['top','top5','top10','resetday']
handler.tags = ['stats']
handler.help = ['top']

export default handler

// ============================
// 🌙 INVIO AUTOMATICO MEZZANOTTE
// ============================

setInterval(async () => {

  const now = new Date()

  if (now.getHours() === 0 && now.getMinutes() === 0) {

    let db = loadDB()

    for (let groupId in db.groups) {

      let ranking = Object.entries(db.users)
        .map(([jid, data]) => [jid, data.todayMessages || 0])
        .filter(([_, total]) => total > 0)
        .sort((a, b) => b[1] - a[1])

      if (!ranking.length) continue

      let text = '🌙 *CLASSIFICA FINALE DI OGGI*\n\n'

      ranking.slice(0,5).forEach(([jid, total], i) => {
        text += `${i+1}° @${jid.split('@')[0]} - ${total} messaggi\n`
      })

      await global.conn.sendMessage(groupId, {
        text,
        mentions: ranking.slice(0,5).map(x => x[0])
      })

      // NON resetta automaticamente
    }
  }

}, 60000)