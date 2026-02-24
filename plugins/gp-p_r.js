var handler = async (m, { conn, text, command }) => {
  let action, successTitle, errorMsg
  let sender = m.sender

  // 🔥 PRENDE TUTTI GLI UTENTI TAGGATI
  let users = []

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    users = m.mentionedJid
  } else if (m.quoted && m.quoted.sender) {
    users = [m.quoted.sender]
  } else if (text) {
    let numbers = text.split(/[\s,]+/).filter(v => !isNaN(v))
    users = numbers.map(n => n + '@s.whatsapp.net')
  }

  if (!users.length) {
    return conn.reply(m.chat, '⚠️ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 • Devi menzionare almeno un utente per il rituale!', m)
  }

  if (['promote', 'promuovi', 'p', 'p2'].includes(command)) {
    action = 'promote'
    successTitle = '⚡ PROMOZIONE COMPLETATA ⚡'
    errorMsg = '💀 Il rituale di potere è fallito!'
  }

  if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote'
    successTitle = '☠️ RETROCESSIONE COMPLETATA ☠️'
    errorMsg = '💀 Tentativo di abbassamento fallito!'
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, users, action)

    let tagList = users.map(u => '@' + u.split('@')[0]).join(' ')

    let successMsg = `
╭━━━⚡ 𝐃𝐀𝐍𝐆𝐄𝐑 𝐁𝐎𝐓 ⚡━━━╮
│ 🔥 RITUALE DI COMANDO ESEGUITO
│
│ 👥 Bersagli: ${tagList}
│ ✨ Azione: ${successTitle}
│ 🕷️ Da: @${sender.split('@')[0]}
│
│ ☠️ Il Nexus osserva...
╰━━━━━━━━━━━━━━━━╯
`.trim()

    conn.reply(m.chat, successMsg, m, {
      mentions: [sender, ...users]
    })

  } catch (e) {
    conn.reply(m.chat, `💀 ${errorMsg}`, m)
  }
}

handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.owner = true
handler.botAdmin = true

export default handler
