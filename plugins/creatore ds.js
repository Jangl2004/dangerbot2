import fs from 'fs'
import path from 'path'

const SESSION_DIR = './varesession' 

let handler = async (m, { conn }) => {
    
    if (!fs.existsSync(SESSION_DIR)) {
        return m.reply('❌ Errore: Cartella sessione non trovata.')
    }

    try {
        const files = await fs.promises.readdir(SESSION_DIR)
        let deletedCount = 0

        for (const file of files) {
            if (file !== 'creds.json') {
                const filePath = path.join(SESSION_DIR, file)
                const stat = await fs.promises.stat(filePath)
                
                if (stat.isFile()) {
                    await fs.promises.unlink(filePath)
                    deletedCount++
                }
            }
        }

        // Creazione del messaggio con bottone
        let text = `✅ Pulizia completata!\n\nRimossi *${deletedCount}* file temporanei. Il bot è ora ottimizzato. 🚀`
        
        await conn.sendMessage(m.chat, {
            text: text,
            footer: 'Pulizia del bot',
            buttons: [
                { buttonId: '.ds', buttonText: { displayText: '🔄 Rifai DS' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
        
    } catch (err) {
        console.error(err)
        m.reply('❌ Si è verificato un errore durante la pulizia.')
    }
}

handler.help = ['ds']
handler.tags = ['owner']
handler.command = /^(ds|cleansession)$/i
handler.owner = true

export default handler
