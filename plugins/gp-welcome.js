// 🔥 WELCOME + ADDIO (ON/OFF) — NO IMAGE VERSION

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner, isROwner }) => {
  if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')
  if (!(isAdmin || isOwner || isROwner)) return m.reply('❌ Solo admin possono usare questo comando.')

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}
  chat = global.db.data.chats[m.chat]

  if (chat.welcome == null) chat.welcome = false

  const opt = (args[0] || '').toLowerCase()

  if (!['on', 'off'].includes(opt)) {
    return m.reply(
      `⚙️ *WELCOME SETTINGS*\n\n` +
      `• Attiva: *${usedPrefix}welcome on*\n` +
      `• Disattiva: *${usedPrefix}welcome off*\n\n` +
      `Stato attuale: ${chat.welcome ? '✅ ON' : '❌ OFF'}`
    )
  }

  chat.welcome = (opt === 'on')
  return m.reply(`✅ Welcome & Addio: *${chat.welcome ? 'ON' : 'OFF'}*`)
}

handler.command = /^welcome$/i
handler.group = true
handler.admin = true

// Evento entrata/uscita
handler.participantsUpdate = async function ({ id, participants, action }) {
  try {
    const chat = global.db.data.chats?.[id]
    if (!chat || !chat.welcome) return

    const meta = await this.groupMetadata(id)
    const groupName = meta.subject
    const memberCount = meta.participants.length

    for (const user of participants) {
      const userTag = `@${user.split('@')[0]}`

      // 🔥 ENTRATA
      if (action === 'add') {

        await this.sendMessage(id, {
          react: { text: '🔥', key: { remoteJid: id, fromMe: false, id: String(Date.now()) } }
        }).catch(() => null)

        const text = `
╔══════════════════╗
      ⚠️  THE DANGER  ⚠️
╚══════════════════╝

🔥 Benvenuto ${userTag}
Hai appena varcato i confini di *${groupName}*

👥 Membri attuali: ${memberCount}

⚠️ YOU ARE NOW IN THE DANGER ZONE ⚠️
`.trim()

        await this.sendMessage(id, {
          text,
          mentions: [user]
        })
      }

      // 💀 USCITA
      if (action === 'remove') {

        await this.sendMessage(id, {
          react: { text: '💀', key: { remoteJid: id, fromMe: false, id: String(Date.now()) } }
        }).catch(() => null)

        const text = `
╔══════════════════╗
        💀  ADDIO  💀
╚══════════════════╝

${userTag} ha lasciato *${groupName}*
👥 Membri rimasti: ${memberCount}

Un random in meno 😂 
`.trim()

        await this.sendMessage(id, {
          text,
          mentions: [user]
        })
      }
    }
  } catch (e) {
    console.error('Errore welcome:', e)
  }
}

export default handler
