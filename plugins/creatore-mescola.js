const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, participants, command, isOwner }) => {

  global.db.data.groups = global.db.data.groups || {}
  let groupData = global.db.data.groups[m.chat] || (global.db.data.groups[m.chat] = {})

  // 🛡️ PROTEZIONE TOTALE: Identifica il bot in modo ultra-preciso
  const botJid = conn.user.id.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user.id
  
  // Lista dei proprietari (Owner) dal file di configurazione
  const owners = global.owner ? global.owner.map(v => v[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net') : []
  
  // Chi NON deve mai essere toccato
  const whitelist = [botJid, ...owners]

  if (command === 'mescoladmin') {
    if (groupData.active) return conn.reply(m.chat, '⚠️ Mescolamento già attivo.', m)

    // 🔹 Trova admin attuali (ESCLUDE BOT E OWNER)
    let oldAdmins = participants
      .filter(p => p.admin && !whitelist.some(w => w === p.id))
      .map(p => p.id)

    // 🔹 Trova membri normali (ESCLUDE BOT E OWNER)
    let members = participants
      .filter(p => !p.admin && !whitelist.some(w => w === p.id))
      .map(p => p.id)

    if (members.length < 3) return conn.reply(m.chat, '⚠️ Servono almeno 3 membri (non admin/owner) per procedere.', m)

    // Sceglie 3 nuovi admin a caso
    let shuffled = members.sort(() => 0.5 - Math.random())
    let newAdmins = shuffled.slice(0, 3)

    groupData.oldAdmins = oldAdmins
    groupData.tempAdmins = newAdmins
    groupData.active = true

    try {
      // 1. Toglie admin ai vecchi (solo se non sono in whitelist)
      for (let user of oldAdmins) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
        await delay(500) // Pausa tecnica per evitare blocchi
      }

      // 2. Mette admin i nuovi scelti
      for (let user of newAdmins) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
        await delay(500)
      }

      let tagList = newAdmins.map(u => '@' + u.split('@')[0]).join(' ')
      conn.reply(m.chat, `🎲 *ADMIN MESCOLATI*\n\nNuovi admin:\n${tagList}\n\nIl Bot e i Proprietari sono rimasti admin.`, m, { mentions: newAdmins })

    } catch (e) {
      console.error(e)
      conn.reply(m.chat, '❌ Errore durante l\'aggiornamento dei ruoli.', m)
    }
  }

  if (command === 'ripristinaadmin') {
    if (!groupData.active) return conn.reply(m.chat, '⚠️ Nessun mescolamento attivo.', m)

    try {
      // Toglie i temporanei
      for (let user of groupData.tempAdmins || []) {
        if (!whitelist.some(w => w === user)) {
          await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
          await delay(500)
        }
      }

      // Rimette i vecchi
      for (let user of groupData.oldAdmins || []) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
        await delay(500)
      }

      delete groupData.oldAdmins
      delete groupData.tempAdmins
      delete groupData.active
      conn.reply(m.chat, '✅ Admin originali ripristinati.', m)
    } catch (e) {
      conn.reply(m.chat, '❌ Errore nel ripristino.', m)
    }
  }
}

handler.command = ['mescoladmin', 'ripristinaadmin']
handler.group = true
handler.owner = true // Solo l'owner può lanciare il comando
handler.botAdmin = true

export default handler
