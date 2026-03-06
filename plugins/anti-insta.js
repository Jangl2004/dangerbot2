let linkRegex = /(?:https?:\/\/|www\.)[^\s]*instagram[^\s]*|(?:^|\s)[^\s]*instagram[^\s]*\.(com|it|net|org|ru|me|co|io|tv)(?:\/[^\s]*)?/i

export async function before(m, { isAdmin, isPrems, isBotAdmin, conn }) {
  if (m.isBaileys || m.fromMe) return true
  if (!m.isGroup) return false

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.users = global.db.data.users || {}

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let chat = global.db.data.chats[m.chat]

  // ATTIVO DI DEFAULT
  if (chat.antiInsta === undefined) {
    chat.antiInsta = true
  }

  // Se disattivato manualmente, non fa nulla
  if (chat.antiInsta === false) return false

  let warnLimit = 3
  let senderId = m.key.participant || m.sender
  let messageId = m.key.id

  let text =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''

  const isInstagramLink = linkRegex.exec(text)

  if (isInstagramLink && !isAdmin && !isPrems) {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    global.db.data.users[m.sender].warn = global.db.data.users[m.sender].warn || 0
    global.db.data.users[m.sender].warnReasons = global.db.data.users[m.sender].warnReasons || []

    global.db.data.users[m.sender].warn += 1
    global.db.data.users[m.sender].warnReasons.push('link instagram')

    // Elimina il messaggio solo se il bot è admin
    if (isBotAdmin) {
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: messageId,
            participant: senderId,
          },
        })
      } catch (e) {
        console.error('Errore eliminazione messaggio antiInsta:', e)
      }
    }

    let warnCount = global.db.data.users[m.sender].warn
    let remaining = warnLimit - warnCount

    if (warnCount < warnLimit) {
      await conn.sendMessage(m.chat, {
        text: `╔═══━─━─━─━─━─━─━═══╗
   ⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • 𝐀𝐍𝐓𝐈𝐈𝐍𝐒𝐓𝐀
╚═══━─━─━─━─━─━─━═══╝
📡 LINK INSTAGRAM RILEVATO

⚠️ Avvertimento: ${warnCount}/${warnLimit}
🔹 Rimangono: ${remaining}

Prossima violazione → espulsione.
━━━━━━━━━━━━━━━━━━`
      })
    } else {
      global.db.data.users[m.sender].warn = 0
      global.db.data.users[m.sender].warnReasons = []

      await conn.sendMessage(m.chat, {
        text: `╔═══━─━─━─━─━─━─━═══╗
   ⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • 𝐏𝐔𝐍𝐈𝐙𝐈𝐎𝐍𝐄
╚═══━─━─━─━─━─━─━═══╝
💀 LIMITE SUPERATO

🔹 Utente rimosso dal Gruppo.
━━━━━━━━━━━━━━━━━━`
      })

      if (isBotAdmin) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        } catch (e) {
          console.error('Errore rimozione utente antiInsta:', e)
        }
      } else {
        await conn.sendMessage(m.chat, {
          text: '⚠️ Non sono amministratore, quindi non posso rimuovere l’utente.'
        })
      }
    }
  }

  return false
}
