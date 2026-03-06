import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {

if (!text) return conn.reply(m.chat,'❌ URL mancante',m)

await conn.reply(m.chat,'🎧 Scarico audio...',m)

try {

let res = await fetch(`https://api.vevioz.com/api/button/mp3/${encodeURIComponent(text)}`)

let html = await res.text()

let match = html.match(/https?:\/\/[^"]+\.mp3/)

if(!match) throw 'Audio non trovato'

let audio = match[0]

await conn.sendMessage(m.chat,{
audio:{url:audio},
mimetype:'audio/mpeg'
},{quoted:m})

} catch(e){

conn.reply(m.chat,'❌ Errore download audio',m)

}

}

handler.command = ['playmp3']

export default handler
