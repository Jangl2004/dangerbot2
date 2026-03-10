import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    // Lista delle cartelle sessioni più comuni nei bot Baileys/VareBot
    const possibiliCartelle = ['./session', './sessions', './auth_info_baileys', './auth_info', './sessione']
    
    // Trova la prima cartella esistente nella lista
    let sessionPath = possibiliCartelle.find(p => fs.existsSync(p))

    if (!sessionPath) {
        return m.reply('❌ Errore: Non ho trovato nessuna cartella di sessione (ho cercato session, sessions, auth_info_baileys). Controlla il nome della cartella nel tuo file manager.')
    }

    try {
        const files = await fs.promises.readdir(sessionPath)
        let deletedCount = 0

        for (const file of files) {
            // Fondamentale: NON eliminare creds.json o il bot si disconnette
            if (file !== 'creds.json') {
                const filePath = path.join(sessionPath, file)
                const stat = await fs.promises.stat(filePath)
                
                // Elimina solo i file, non le sottocartelle
                if (stat.isFile()) {
                    await fs.promises.unlink(filePath)
                    deletedCount++
                }
            }
        }

        if (deletedCount === 0) {
            return m.reply(`✨ La cartella *${sessionPath}* è già pulita! Non c'erano file inutili da rimuovere.`)
        }

        m.reply(`✅ Pulizia completata nella cartella: *${sessionPath}*\n\nEliminati **${deletedCount}** file di sessione "sporchi".\nIl file *creds.json* è stato salvato.`)
        
    } catch (err) {
        console.error(err)
        m.reply('❌ Si è verificato un errore durante la pulizia dei file.')
    }
}

handler.help = ['ds']
handler.tags = ['owner']
handler.command = /^(ds|cleansession)$/i
handler.owner = true // Solo il proprietario può usarlo

export default handler
