import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, setReply }) => {
    // Specifica il nome della cartella dove il bot salva le sessioni
    // Di solito in questi bot è './sessions' o './session'
    const sessionPath = './sessions' 

    if (!fs.existsSync(sessionPath)) {
        return m.reply('❌ Cartella sessioni non trovata.')
    }

    try {
        const files = await fs.promises.readdir(sessionPath)
        let deletedCount = 0

        for (const file of files) {
            // MOLTO IMPORTANTE: Non cancellare creds.json o il bot si disconnette
            if (file !== 'creds.json') {
                await fs.promises.unlink(path.join(sessionPath, file))
                deletedCount++
            }
        }

        m.reply(`✅ Pulizia completata! Sono stati rimossi **${deletedCount}** file "sporchi".\nLe credenziali di accesso sono state mantenute al sicuro.`)
    } catch (err) {
        console.error(err)
        m.reply('❌ Si è verificato un errore durante la pulizia.')
    }
}

// Configurazione del comando
handler.help = ['ds']
handler.tags = ['owner']
handler.command = /^(ds|cleansession)$/i
handler.owner = true // Solo tu (il proprietario) puoi usarlo

export default handler
