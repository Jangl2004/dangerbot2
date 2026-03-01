var handler = async (m, { conn, text, command, isOwner }) => {
  // Solo l'owner può usare questo comando
  if (!isOwner) return

  // Otteniamo la lista di tutti i gruppi in cui si trova il bot
  let groups = Object.values(await conn.groupFetchAllParticipating())

  // --- LOGICA COMANDO .gruppi ---
  if (command === 'gruppi') {
    if (groups.length === 0) return conn.reply(m.chat, '⚠️ Il bot non è in nessun gruppo.', m)

    let txt = `🏢 *LISTA GRUPPI NEXUS*\n\n`
    txt += `Scrivi *.esci [numero]* per far uscire il bot.\n\n`

    groups.forEach((g, i) => {
      txt += `*${i + 1}.* ${g.subject}\n`
      txt += `   🆔 \`${g.id}\`\n`
      txt += `   👥 Membri: ${g.participants.length}\n\n`
    })

    return conn.reply(m.chat, txt, m)
  }

  // --- LOGICA COMANDO .esci ---
  if (command === 'esci') {
    if (!text) return conn.reply(m.chat, '⚠️ Specifica il numero del gruppo. Esempio: `.esci 2`', m)
    
    let index = parseInt(text) - 1
    
    if (isNaN(index) || !groups[index]) {
      return conn.reply(m.chat, `❌ Numero non valido. Scegli tra 1 e ${groups.length}`, m)
    }

    let targetGroup = groups[index]
    
    try {
      await conn.reply(targetGroup.id, '👋 Il mio proprietario mi ha chiesto di lasciare questo gruppo. Addio!')
      await conn.groupLeave(targetGroup.id)
      
      return conn.reply(m.chat, `✅ Uscito con successo dal gruppo: *${targetGroup.subject}*`, m)
    } catch (e) {
      console.error(e)
      return conn.reply(m.chat, '❌ Errore durante l\'uscita dal gruppo.', m)
    }
  }
}

handler.help = ['gruppi', 'esci']
handler.tags = ['owner']
handler.command = ['gruppi', 'esci']
handler.owner = true 

export default handler
