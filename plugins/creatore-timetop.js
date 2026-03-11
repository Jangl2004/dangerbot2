const handler = async (m, { conn }) => {
    // Inizializziamo il database globale se non esiste
    global.db.data.users[m.sender].timeCount = global.db.data.users[m.sender].timeCount || 0
    global.db.data.users[m.sender].lastLogin = global.db.data.users[m.sender].lastLogin || Date.now()

    // Calcoliamo il tempo trascorso dall'ultimo messaggio
    let ora = Date.now()
    let diff = ora - global.db.data.users[m.sender].lastLogin
    
    // Aggiorniamo il totale (solo se l'ultima attività è recente, es. 10 min)
    if (diff < 600000) { 
        global.db.data.users[m.sender].timeCount += diff
    }
    global.db.data.users[m.sender].lastLogin = ora

    if (m.text.startsWith('.tempo')) {
        let userTime = global.db.data.users[m.sender].timeCount
        const totalSeconds = Math.floor(userTime / 1000)
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
        const m_ = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
        const s = (totalSeconds % 60).toString().padStart(2, '0')

        let caption = `🕒 *Tempo Online Oggi*\n`
        caption += `👤 @${m.sender.split('@')[0]}\n`
        caption += `⏱️ *${h}:${m_}:${s}*`

        await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m })
    }
}

handler.command = /^(tempo)$/i
export default handler
