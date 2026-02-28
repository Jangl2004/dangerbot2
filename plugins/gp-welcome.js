// 🌍 WELCOME + ADDIO UNIVERSALE (ON/OFF)

let handler = async (m, { args, usedPrefix, command, isAdmin, isOwner, isROwner }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')
  if (!(isAdmin || isOwner || isROwner)) return m.reply('❌ Solo admin possono usare questo comando.')

  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  if (chat.welcome == null) chat.welcome = false

  const opt = (args[0] || '').toLowerCase()

  if (!['on', 'off'].includes(opt)) {
    return m.reply(
      `⚙️ *WELCOME SETTINGS*\n\n` +
      `• Attiva: *${usedPrefix + command} on*\n` +
      `• Disattiva: *${usedPrefix + command} off*\n\n` +
      `Stato attuale: ${chat.welcome ? '✅ ON' : '❌ OFF'}`
    )
  }

  chat.welcome = (opt === 'on')
  return m.reply(`✅ Welcome & Addio: *${chat.welcome ? 'ON' : 'OFF'}*`)
}

handler.help = ['welcome on/off']
handler.tags = ['group']
handler.command = /^welcome$/i
handler.group = true
handler.admin = true

// Evento join/leave compatibile
handler.before = async function (m, { conn }) {
  try {
    if (!m.isGroup) return
    if (!global.db.data.chats?.[m.chat]?.welcome) return

    const stub = m.messageStubType
    if (stub !== 27 && stub !== 28) return

    const users = m.messageStubParameters || []
    if (!users.length) return

    const meta = await conn.groupMetadata(m.chat).catch(() => null)
    const groupName = meta?.subject || 'Gruppo'
    const memberCount = meta?.participants?.length || 0

    for (const user of users) {
      const userTag = `@${user.split('@')[0]}`

      // 🎉 ENTRATA
      if (stub === 27) {

        await conn.sendMessage(m.chat, { react: { text: '👋', key: m.key } }).catch(() => null)

        const text = `
╔══════════════════╗
        🎉  BENVENUTO  🎉
╚══════════════════╝

Ciao ${userTag} 👋
Benvenuto in *${groupName}*

👥 Membri attuali: ${memberCount}

Leggi le regole in descrizione per evitare di essere kickato. Buona permanenza
`.trim()

        await conn.sendMessage(m.chat, { text, mentions: [user] })
      }

      // 🚪 USCITA
      if (stub === 28) {

        await conn.sendMessage(m.chat, { react: { text: '👋', key: m.key } }).catch(() => null)

        const text = `
╔══════════════════╗
        🚪  ADDIO  🚪
╚══════════════════╝

${userTag} ha lasciato *${groupName}*

👥 Membri rimasti: ${memberCount}

Un random di merda in meno 👋 
`.trim()

        await conn.sendMessage(m.chat, { text, mentions: [user] })
      }
    }

  } catch (e) {
    console.error('Errore welcome:', e)
  }
}

export default handler
