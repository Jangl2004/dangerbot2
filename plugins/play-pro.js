import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'

// Questa è la funzione principale che l'handler eseguirà
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🎵 *Usa:* ${usedPrefix + command} nome canzone`)

    try {
        // Messaggio di attesa
        await m.reply('🔎 *Ricerca su YouTube...*')

        let search = await yts(text)
        let v = search.videos[0]
        if (!v) return m.reply('❌ Nessun risultato trovato')

        let caption = `🎧 *GIUSEBOT PLAYER*\n\n`
        caption += `📝 *Titolo:* ${v.title}\n`
        caption += `⏱️ *Durata:* ${v.timestamp}\n`
        caption += `📺 *Canale:* ${v.author.name}\n\n`
        caption += `*Rispondi* a questo messaggio con:\n`
        caption += `1️⃣ per scaricare l'audio (MP3)\n`
        caption += `2️⃣ per scaricare il video (MP4)`

        // Inviamo l'immagine con le istruzioni
        let sentMsg = await conn.sendMessage(m.chat, {
            image: { url: v.thumbnail },
            caption: caption,
            footer: 'GiuseBot'
        }, { quoted: m })

        // Gestione della risposta tramite waitForResponse (che è presente nel tuo handler!)
        conn.waitForResponse(m.chat, m.sender, {
            timeout: 60000,
            filter: (msg) => msg.quoted && msg.quoted.id === sentMsg.key.id,
            onTimeout: () => console.log('Timeout download play')
        }).then(async (response) => {
            if (!response) return
            let scelta = response.text.trim()
            
            if (scelta === '1') {
                await downloadMedia(m, conn, v.url, 'mp3')
            } else if (scelta === '2') {
                await downloadMedia(m, conn, v.url, 'mp4')
            }
        })

    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante la ricerca')
    }
}

// Funzione di supporto per il download
async function downloadMedia(m, conn, url, type) {
    const file = `./tmp/${Date.now()}.${type}`
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')

    await m.reply(`⏳ Scaricamento ${type.toUpperCase()}...`)

    const cmd = type === 'mp3' 
        ? `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`
        : `yt-dlp -f mp4 -o "${file}" "${url}"`

    exec(cmd, async (err) => {
        if (err) return m.reply('❌ Errore nel download. Assicurati che yt-dlp sia installato sul server.')

        const buffer = fs.readFileSync(file)
        if (type === 'mp3') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4' }, { quoted: m })
        }
        if (fs.existsSync(file)) fs.unlinkSync(file)
    })
}

// Fondamentale: l'handler deve essere esportato così per funzionare con il tuo sistema
handler.command = ['play']
handler.help = ['play']
handler.tags = ['downloader']

export default handler
