let handler = async (m, { args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('Questo comando funziona solo nei gruppi.')
  if (!isAdmin && !isOwner) return m.reply('Solo gli amministratori possono usare questo comando.')

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  let chat = global.db.data.chats[m.chat]

  if (!args[0]) {
    return m.reply(`⚡ *ANTI-TELEGRAM*

Stato attuale: *${chat.antiTelegram === false ? 'DISATTIVATO' : 'ATTIVO'}*

Comandi:
.antitelegram on
.antitelegram off`)
  }

  if (args[0].toLowerCase() === 'on') {
    chat.antiTelegram = true
    return m.reply('✅ AntiTelegram attivato.')
  }

  if (args[0].toLowerCase() === 'off') {
    chat.antiTelegram = false
    return m.reply('❌ AntiTelegram disattivato.')
  }

  return m.reply('Usa: .antitelegram on oppure .antitelegram off')
}

handler.command = ['antitelegram']
export default handler
