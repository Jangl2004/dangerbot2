const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, isBotAdmin, isAdmin }) => {
  if (!isAdmin) return 
  if (!isBotAdmin) return m.reply('⚠️ Il bot deve essere admin.')

  try {
    // 1. DISATTIVA APPROVAZIONE (Apertura)
    await conn.query({
      tag: 'iq',
      attrs: {
        to: m.chat,
        type: 'set',
        xmlns: 'w:g2',
      },
      content: [{
        tag: 'membership_approval_mode',
        attrs: {},
        content: [{
          tag: 'group_join',
          attrs: { state: 'off' } 
        }]
      }]
    })
    
    // Unico messaggio di avviso
    await conn.sendMessage(m.chat, { text: '🔓 *ACCESSO LIBERO* (2s)' }, { quoted: m })

    // 2. ATTENDE 2 SECONDI
    await delay(2000)

    // 3. RIATTIVA APPROVAZIONE (Chiusura silenziosa)
    await conn.query({
      tag: 'iq',
      attrs: {
        to: m.chat,
        type: 'set',
        xmlns: 'w:g2',
      },
      content: [{
        tag: 'membership_approval_mode',
        attrs: {},
        content: [{
          tag: 'group_join',
          attrs: { state: 'on' } 
        }]
      }]
    })
    
    // Nessun messaggio qui, il bot ha finito.

  } catch (e) {
    console.error("ERRORE_QUERY_DIRETTA:", e)
    m.reply('❌ Errore critico: il gruppo non supporta l\'approvazione.')
  }
}

handler.help = ['accetta']
handler.tags = ['group']
handler.command = ['accetta', 'acetta'] 

handler.group = true
handler.admin = true 
handler.botAdmin = true

export default handler
