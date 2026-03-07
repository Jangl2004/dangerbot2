import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🎵 *Usa:* ${usedPrefix + command} nome canzone`)

    await m.reply('🔎 *Ricerca su YouTube...*')
    let search = await yts(text)
    let v = search.videos[0]
    if (!v) return m.reply('❌ Nessun risultato trovato')

    // Creiamo una struttura temporanea nel bot
    // Usiamo il messaggio corrente come "trigger" per la risposta successiva
    let caption = `🎧 *GIUSEBOT PLAYER*\n\n📝 *Titolo:* ${v.title}\n\n*Rispondi* a questo messaggio con:\n1️⃣ per MP3\n2️⃣ per MP4`
    
    let sentMsg = await conn.sendMessage(m.chat, { image: { url: v.thumbnail }, caption: caption }, { quoted: m })

    // Definiamo un mini-handler temporaneo che ascolta la risposta
    // Questo è il modo più pulito per farlo senza dipendere dal tuo handler.js
    const id = sentMsg.key.id
    
    conn.ev.on('messages.upsert', async (msgUpdate) => {
        let msg = msgUpdate.messages[0]
        if (!msg.message || !msg.message.extendedTextMessage) return
        
        let quotedId = msg.message.extendedTextMessage.contextInfo?.stanzaId
        if (quotedId !== id) return
        
        let choice = msg.message.extendedTextMessage.text.trim()
        if (choice !== '1' && choice !== '2') return

        // Rimuoviamo l'evento dopo aver ricevuto la risposta
        conn.ev.removeAllListeners('messages.upsert')

        let type = choice === '1' ? 'mp3' : 'mp4'
        await downloadMedia(m, conn, v.url, type)
    })
}

async function downloadMedia(m, conn, url, type) {
    const file = `./tmp/${Date.now()}.${type}`
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')

    await m.reply(`⏳ Scaricamento ${type.toUpperCase()} in corso...`)
    
    const cmd = type === 'mp3' 
        ? `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`
        : `yt-dlp -f "best[ext=mp4]" -o "${file}" "${url}"`

    exec(cmd, async (err) => {
        if (err) return m.reply('❌ Errore durante il download')
        
        let buffer = fs.readFileSync(file)
        if (type === 'mp3') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4' }, { quoted: m })
        }
        if (fs.existsSync(file)) fs.unlinkSync(file)
    })
}

handler.command = ['play']
export default handler
