const handler = async (m, { conn, args }) => {
  if (!m.isGroup) {
    return m.reply('☠️ Questo rituale può essere evocato solo nei gruppi.')
  }

  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants

  const admins = participants.filter(p => p.admin)

  // FIX: Otteniamo i nomi invece dei semplici numeri per la lista visibile
  let adminMentions = ''
  for (let admin of admins) {
    // Prova a prendere il nome registrato, altrimenti usa il pushname o il numero
    let name = conn.getName(admin.id)
    adminMentions += ` @${admin.id.split('@')[0]} (${name})\n`
  }

  // Costruisci messaggio
  const ritualMsg = args.length 
    ? `📜 𝕄𝔼𝕊𝕊𝔸𝔾𝔾𝕀𝕆: ${args.join(' ')}` 
    : ''

  const text = `
🩸 Evocazione Amministratori
${ritualMsg}

⚔️ 𝐀𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐢 Evocati:
${adminMentions}
`.trim()

  await conn.sendMessage(m.chat, {
    text,
    mentions: admins.map(a => a.id)
  }, { quoted: m })
}

handler.help = ['admins [messaggio]']
handler.tags = ['group']
handler.command = /^admins$/i
handler.group = true

export default handler
