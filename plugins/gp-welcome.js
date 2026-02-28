// 🔥 WELCOME + ADDIO (ON/OFF) — compatibile via messageStubType

let handler = async (m, { args, usedPrefix, command, isAdmin, isOwner, isROwner }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')
  if (!(isAdmin || isOwner || isROwner)) return m.reply('❌ Solo admin (o owner) possono usare questo comando.')

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

// ⚙️ Qui intercettiamo entrate/uscite (molto più compatibile)
handler.before = async function (m, { conn }) {
  try {
    if (!m.isGroup) return
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    const chat = global.db.data.chats[m.chat]
    if (!chat.welcome) return

    // Nei bot MD: join/leave arrivano come "stub"
    // 27 = add, 28 = remove (in molti fork)
    const stub = m.messageStubType
    if (stub !== 27 && stub !== 28) return

    const users = m.messageStubParameters || []
    if (!users.length) return

    const meta = await conn.groupMetadata(m.chat).catch(() => null)
    const groupName = meta?.subject || 'Gruppo'
    const memberCount = meta?.participants?.length || 0

    for (const user of users) {
      const userTag = `@${user.split('@')[0]}`

      if (stub === 27) {
        await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } }).catch(() => null)

        const text = `
╔══════════════════╗
      ⚠️  THE DANGER  ⚠️
╚══════════════════╝

🔥 Benvenuto ${userTag}
Hai appena varcato i confini di *${groupName}*

👥 Membri attuali: ${memberCount}

⚠️ YOU ARE NOW IN THE DANGER ZONE ⚠️
`.trim()

        await conn.sendMessage(m.chat, { text, mentions: [user] })
      }

      if (stub === 28) {
        await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } }).catch(() => null)

        const text = `
╔══════════════════╗
        💀  ADDIO  💀
╚══════════════════╝

${userTag} ha lasciato *${groupName}*
👥 Membri rimasti: ${memberCount}

Un random di merda in meno
`.trim()

        await conn.sendMessage(m.chat, { text, mentions: [user] })
      }
    }
  } catch (e) {
    console.error('Errore welcome(before):', e)
  }
}

export default handler
