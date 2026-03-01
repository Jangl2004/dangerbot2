var handler = async (m, { conn, participants, command }) => {

  global.db.data.groups = global.db.data.groups || {}
  let groupData = global.db.data.groups[m.chat] || (global.db.data.groups[m.chat] = {})

  // 1. Identifica chiaramente il BOT e gli OWNER
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  const owners = global.owner.map(v => v[0] + '@s.whatsapp.net') // Prende la lista owner dalla config
  
  // Lista nera (chi NON deve MAI essere toccato dal demote)
  const whitelist = [botJid, ...owners]

  if (command === 'mescoladmin') {

    if (groupData.active)
      return conn.reply(m.chat, '⚠️ Mescolamento già attivo. Usa .ripristinaadmin prima.', m)

    // 🔹 Admin attuali (ESCLUDE BOT E OWNER)
    let oldAdmins = participants
      .filter(p => p.admin && !whitelist.includes(p.id))
      .map(p => p.id)

    if (oldAdmins.length === 0)
      return conn.reply(m.chat, '⚠️ Nessun admin (oltre a bot/owner) da mescolare.', m)

    // 🔹 Membri normali (ESCLUDE BOT E OWNER)
    let members = participants
      .filter(p => !p.admin && !whitelist.includes(p.id))
      .map(p => p.id)

    if (members.length < 3)
      return conn.reply(m.chat, '⚠️ Servono almeno 3 membri comuni per il mescolamento.', m)

    // Mescola e seleziona i primi 3
    let shuffled = members.sort(() => 0.5 - Math.random())
    let newAdmins = shuffled.slice(0, 3)

    groupData.oldAdmins = oldAdmins
    groupData.tempAdmins = newAdmins
    groupData.active = true

    try {
      // 🔻 Demote vecchi admin (solo quelli non in whitelist)
      for (let user of oldAdmins) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote').catch(e => console.log(`Errore demote: ${user}`))
      }

      // 🔺 Promote nuovi admin
      for (let user of newAdmins) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote').catch(e => console.log(`Errore promote: ${user}`))
      }

      let tagList = newAdmins.map(u => '@' + u.split('@')[0]).join('\n')

      conn.reply(m.chat,
`🎲 *NEXUS BOT: SHUFFLE* 👑

*Nuovi Admin Temporanei:*
${tagList}

⏳ _Gli admin originali sono stati salvati._`,
        m,
        { mentions: newAdmins }
      )

    } catch (e) {
      console.error(e)
      conn.reply(m.chat, '❌ Errore critico durante il processo.', m)
    }
  }

  if (command === 'ripristinaadmin') {

    if (!groupData.active)
      return conn.reply(m.chat, '⚠️ Non c\'è un mescolamento attivo da ripristinare.', m)

    try {
      // Toglie i permessi ai temporanei
      for (let user of groupData.tempAdmins || []) {
        if (whitelist.includes(user)) continue
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote').catch(e => {})
      }

      // Ridà i permessi agli originali
      for (let user of groupData.oldAdmins || []) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote').catch(e => {})
      }

      delete groupData.oldAdmins
      delete groupData.tempAdmins
      delete groupData.active

      conn.reply(m.chat, '✅ Struttura admin originale ripristinata con successo.', m)

    } catch (e) {
      conn.reply(m.chat, '❌ Errore durante il ripristino.', m)
    }
  }
}

handler.command = ['mescoladmin', 'ripristinaadmin']
handler.group = true
handler.owner = true
handler.botAdmin = true

export default handler
