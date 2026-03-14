const handler = async (m, { conn, args }) => {
  if (!m.isGroup) {
    return m.reply('☠️ Questo rituale può essere evocato solo nei gruppi.')
  }

  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants
  const admins = participants.filter(p => p.admin)

  // Creiamo una lista dove ogni admin ha un nome o un punto fermo
  // Invece di scrivere @numero, scriviamo un punto o un carattere per ogni admin
  // WhatsApp userà l'array 'mentions' per trasformare quei punti in tag
  const adminMentions = admins.map(a => `⚔️ @${a.id.split('@')[0]}`).join('\n')

  const ritualMsg = args.length 
    ? `\n📜 𝕄𝔼𝕊𝕊𝔸𝔾𝔾𝕀𝕆: ${args.join(' ')}\n` 
    : ''

  const text = `🩸 *Evocazione Amministratori*${ritualMsg}\n\n${adminMentions}`

  // NOTA: Se vuoi che i numeri non si vedano proprio, 
  // devi cambiare 'adminMentions' sopra in:
  // const adminMentions = admins.map(a => `⚔️`).join('\n')
  
  await conn.sendMessage(m.chat, {
    text: text,
    mentions: admins.map(a => a.id)
  }, { quoted: m })
}

handler.help = ['admins [messaggio]']
handler.tags = ['group']
handler.command = /^admins$/i
handler.group = true

export default handler
