const handler = async (m, { conn, args }) => {
  if (!m.isGroup) {
    return m.reply('☠️ Questo rituale può essere evocato solo nei gruppi.')
  }

  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants
  const admins = participants.filter(p => p.admin)

  // Crea la lista usando solo il formato @numero che WhatsApp trasforma in "Nome Verde"
  const adminMentions = admins.map(a => `⚔️ @${a.id.split('@')[0]}`).join('\n')

  const ritualMsg = args.length 
    ? `📜 𝕄𝔼𝕊𝕊𝔸𝔾𝔾𝕀𝕆: ${args.join(' ')}` 
    : ''

  const text = `
🩸 *Evocazione Amministratori*
${ritualMsg}

${adminMentions}
`.trim()

  await conn.sendMessage(m.chat, {
    text,
    mentions: admins.map(a => a.id) // Questo è fondamentale per farli diventare verdi
  }, { quoted: m })
}

handler.help = ['admins [messaggio]']
handler.tags = ['group']
handler.command = /^admins$/i
handler.group = true

export default handler
