let handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  const ownerJids = global.owner
    .map(o => (typeof o === 'object' ? o[0] : o) + '@s.whatsapp.net')

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'

  let admins = participants.filter(
    p => p.admin === 'admin' || p.admin === 'superadmin'
  )

  let toDemote = admins
    .map(p => p.jid)
    .filter(jid =>
      jid &&
      jid !== botJid &&
      !ownerJids.includes(jid)
    )

  if (!toDemote.length) return

  try {
    // 🔻 Demote admin
    await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote')

    // 🔥 Cambio nome gruppo
    let metadata = await conn.groupMetadata(m.chat)
    let oldName = metadata.subject

    let newName = `${oldName} | RUB BY THE DANGER `

    await conn.groupUpdateSubject(m.chat, newName)

    await m.reply(
      'GRUPPO RUBATO BY THE DANGER '
    )
  } catch (e) {
    console.error('Errore nel comando domina:', e)
  }
}

handler.help = ['rubagp']
handler.tags = ['group']
handler.command = /^(rubagp)$/i
handler.group = true
handler.owner = true

export default handler
